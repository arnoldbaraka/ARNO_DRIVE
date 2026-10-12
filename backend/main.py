import sqlite3,os,time,secrets,hashlib
from fastapi import FastAPI,HTTPException,Header
from pydantic import BaseModel,Field
from pathlib import Path
app=FastAPI(title='ARNO Drive Beta API')
db=Path(os.getenv('ARNO_DB',str(Path(__file__).parent/'data.sqlite3')))
def sql(q,params=(),fetch=False):
 db.parent.mkdir(parents=True,exist_ok=True)
 with sqlite3.connect(db) as c:
  c.row_factory=sqlite3.Row
  result=c.execute(q,params)
  return [dict(x) for x in result.fetchall()] if fetch else result.lastrowid
for q in ['CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT UNIQUE,name TEXT,password TEXT,salt TEXT)','CREATE TABLE IF NOT EXISTS tokens(token TEXT PRIMARY KEY,uid INTEGER,expiry INTEGER)','CREATE TABLE IF NOT EXISTS listings(id INTEGER PRIMARY KEY,uid INTEGER,make TEXT,model TEXT,year INTEGER,price INTEGER,mileage INTEGER,location TEXT,description TEXT,status TEXT DEFAULT "pending")','CREATE TABLE IF NOT EXISTS businesses(id INTEGER PRIMARY KEY,uid INTEGER,name TEXT,category TEXT,county TEXT,address TEXT,status TEXT DEFAULT "pending")']:
 sql(q)
class Account(BaseModel):
 email:str
 password:str=Field(min_length=12)
 name:str='Driver'
class Listing(BaseModel):
 make:str=Field(min_length=1,max_length=70)
 model:str=Field(min_length=1,max_length=70)
 year:int=Field(ge=1900,le=2030)
 price:int=Field(gt=0)
 mileage:int=Field(ge=0)
 location:str=Field(min_length=2,max_length=120)
 description:str=Field(default='',max_length=2000)
class Business(BaseModel):
 name:str
 category:str
 county:str
 address:str
def user(auth):
 if not auth or not auth.startswith('Bearer '):raise HTTPException(401,'Login required')
 rows=sql('SELECT uid FROM tokens WHERE token=? AND expiry>?',(hashlib.sha256(auth[7:].encode()).hexdigest(),int(time.time())),True)
 if not rows:raise HTTPException(401,'Session expired')
 return rows[0]['uid']
def token(uid):
 t=secrets.token_urlsafe(32)
 sql('INSERT INTO tokens VALUES(?,?,?)',(hashlib.sha256(t.encode()).hexdigest(),uid,int(time.time())+86400))
 return {'access_token':t,'token_type':'bearer'}
@app.get('/health')
def health():return {'status':'ok'}
@app.post('/auth/signup')
def signup(a:Account):
 if '@' not in a.email:raise HTTPException(422,'Invalid email')
 salt=secrets.token_hex(16)
 pw=hashlib.scrypt(a.password.encode(),salt=bytes.fromhex(salt),n=16384,r=8,p=1).hex()
 try:uid=sql('INSERT INTO users(email,name,password,salt) VALUES(?,?,?,?)',(a.email.lower().strip(),a.name,pw,salt))
 except sqlite3.IntegrityError:raise HTTPException(409,'Account exists')
 return token(uid)
@app.post('/auth/login')
def login(a:Account):
 rows=sql('SELECT * FROM users WHERE email=?',(a.email.lower().strip(),),True)
 if not rows:raise HTTPException(401,'Invalid login')
 r=rows[0];pw=hashlib.scrypt(a.password.encode(),salt=bytes.fromhex(r['salt']),n=16384,r=8,p=1).hex()
 if not secrets.compare_digest(pw,r['password']):raise HTTPException(401,'Invalid login')
 return token(r['id'])
@app.post('/listings')
def add_listing(a:Listing,authorization:str|None=Header(None)):
 uid=user(authorization)
 return {'id':sql('INSERT INTO listings(uid,make,model,year,price,mileage,location,description) VALUES(?,?,?,?,?,?,?,?)',(uid,a.make,a.model,a.year,a.price,a.mileage,a.location,a.description)),'status':'pending_review'}
@app.get('/listings')
def listings():return sql('SELECT id,make,model,year,price,mileage,location,description FROM listings WHERE status="approved" ORDER BY id DESC LIMIT 100',fetch=True)
@app.post('/businesses')
def add_business(a:Business,authorization:str|None=Header(None)):
 uid=user(authorization)
 return {'id':sql('INSERT INTO businesses(uid,name,category,county,address) VALUES(?,?,?,?,?)',(uid,a.name,a.category,a.county,a.address)),'status':'pending_verification'}
@app.get('/businesses')
def businesses():return sql('SELECT id,name,category,county,address FROM businesses WHERE status="verified" LIMIT 200',fetch=True)
