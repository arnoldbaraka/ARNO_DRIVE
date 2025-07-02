import React, { useState } from 'react';
import { db, auth } from '../../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './VirtualGifting.css';

const gifts = [
  { id: 'boost', name: 'Nitro Boost', cost: 50, icon: '⚡' },
  { id: 'helmet', name: 'Racing Helmet', cost: 100, icon: '⛑️' },
  { id: 'trophy', name: 'Champion Trophy', cost: 500, icon: '🏆' },
  { id: 'flag', name: 'Checkered Flag', cost: 250, icon: '🏁' },
];

export default function VirtualGifting({ driverId }) {
  const [selectedGift, setSelectedGift] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSendGift = async () => {
    if (!selectedGift || !auth.currentUser) return;
    
    setIsSending(true);
    
    try {
      await addDoc(collection(db, `drivers/${driverId}/gifts`), {
        giftId: selectedGift.id,
        giftName: selectedGift.name,
        fromUserId: auth.currentUser.uid,
        fromUserName: auth.currentUser.displayName,
        message,
        timestamp: serverTimestamp()
      });
      
      // Update driver's virtual currency (simplified)
      await updateDriverCurrency(driverId, selectedGift.cost);
      
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000);
    } catch (error) {
      console.error("Error sending gift:", error);
    } finally {
      setIsSending(false);
      setSelectedGift(null);
      setMessage('');
    }
  };

  const updateDriverCurrency = async (driverId, amount) => {
    // In a real app, this would be a transaction
    console.log(`Driver ${driverId} received ${amount} ARNO tokens`);
  };

  return (
    <div className="virtual-gifting holographic-card">
      <h3>Send Virtual Gift</h3>
      
      {isSent ? (
        <div className="gift-sent">
          <div className="confetti">🎉</div>
          <p>Gift sent successfully!</p>
        </div>
      ) : (
        <>
          <div className="gift-selector">
            {gifts.map(gift => (
              <div 
                key={gift.id}
                className={`gift-option ${selectedGift?.id === gift.id ? 'selected' : ''}`}
                onClick={() => setSelectedGift(gift)}
              >
                <div className="gift-icon">{gift.icon}</div>
                <div className="gift-name">{gift.name}</div>
                <div className="gift-cost">{gift.cost} ARNO</div>
              </div>
            ))}
          </div>

          {selectedGift && (
            <div className="gift-form">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows="2"
              />
              <button 
                onClick={handleSendGift}
                disabled={isSending}
                className="holographic-btn"
              >
                {isSending ? 'Sending...' : `Send ${selectedGift.name}`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}