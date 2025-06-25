// ARNO DRIVE - Advanced Racing Platform JavaScript
// Created by Arnold Baraka - Enhanced Version

// Initialize the application
class ArnoDrive {
    constructor() {
        this.currentUser = null;
        this.selectedRoute = null;
        this.selectedCar = null;
        this.raceMode = 'standard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.loadUserData();
        this.startRealTimeUpdates();
        this.initializeAudio();
    }

    // Car Registration System
    registerCar(carData) {
        const car = {
            id: this.generateId(),
            make: carData.make,
            model: carData.model,
            year: carData.year,
            horsepower: carData.horsepower,
            torque: carData.torque,
            weight: carData.weight,
            class: this.calculateCarClass(carData),
            customizations: {
                turbo: false,
                nitrous: false,
                suspension: 'stock',
                tires: 'street',
                aero: 'stock'
            },
            stats: {
                wins: 0,
                losses: 0,
                bestTime: null,
                totalRaces: 0
            },
            nftId: null,
            registeredAt: new Date().toISOString()
        };

        this.saveCar(car);
        return car;
    }

    calculateCarClass(carData) {
        const powerToWeight = carData.horsepower / (carData.weight / 1000);
        
        if (powerToWeight > 300) return 'S+';
        if (powerToWeight > 250) return 'S';
        if (powerToWeight > 200) return 'A';
        if (powerToWeight > 150) return 'B';
        if (powerToWeight > 100) return 'C';
        return 'D';
    }

    // Race Matchmaking System
    findMatch(carId, routeId) {
        const car = this.getCar(carId);
        const matchmakingPool = this.getMatchmakingPool(car.class, routeId);
        
        // Advanced matchmaking algorithm
        const opponents = matchmakingPool.filter(opponent => {
            const skillDiff = Math.abs(opponent.skillRating - car.skillRating);
            return skillDiff < 200 && opponent.id !== carId;
        });

        if (opponents.length === 0) {
            return this.createAIOpponent(car.class);
        }

        // Sort by best match
        opponents.sort((a, b) => {
            const aDiff = Math.abs(a.skillRating - car.skillRating);
            const bDiff = Math.abs(b.skillRating - car.skillRating);
            return aDiff - bDiff;
        });

        return opponents[0];
    }

    // Real-time Race Simulation
    simulateRace(car1, car2, route) {
        const race = {
            id: this.generateId(),
            participants: [car1, car2],
            route: route,
            startTime: new Date(),
            events: [],
            winner: null
        };

        // Calculate race dynamics
        const car1Performance = this.calculatePerformance(car1, route);
        const car2Performance = this.calculatePerformance(car2, route);

        // Simulate race events
        const raceEvents = this.generateRaceEvents(car1, car2, route);
        
        // Determine winner based on performance and events
        const car1Time = this.calculateRaceTime(car1, route, car1Performance, raceEvents.car1Events);
        const car2Time = this.calculateRaceTime(car2, route, car2Performance, raceEvents.car2Events);

        race.winner = car1Time < car2Time ? car1.id : car2.id;
        race.times = {
            [car1.id]: car1Time,
            [car2.id]: car2Time
        };

        return race;
    }

    calculatePerformance(car, route) {
        const basePerformance = {
            acceleration: car.horsepower / car.weight * 10,
            topSpeed: Math.sqrt(car.horsepower) * 15,
            handling: (car.weight / car.horsepower) * route.technicalRating,
            braking: car.weight / 1000 * route.brakingZones
        };

        // Apply customization bonuses
        if (car.customizations.turbo) {
            basePerformance.acceleration *= 1.15;
            basePerformance.topSpeed *= 1.1;
        }

        if (car.customizations.suspension === 'racing') {
            basePerformance.handling *= 1.2;
        }

        if (car.customizations.tires === 'racing') {
            basePerformance.acceleration *= 1.1;
            basePerformance.braking *= 1.15;
        }

        return basePerformance;
    }

    // Garage Management System
    createGarage() {
        return {
            cars: [],
            capacity: 10,
            level: 1,
            upgrades: {
                lifts: 2,
                paintBooth: false,
                dyno: false,
                toolQuality: 'basic'
            }
        };
    }

    upgradeGarage(upgradeType) {
        const upgradeCosts = {
            capacity: 50000,
            lift: 20000,
            paintBooth: 75000,
            dyno: 100000,
            tools: 30000
        };

        if (this.currentUser.credits >= upgradeCosts[upgradeType]) {
            this.currentUser.credits -= upgradeCosts[upgradeType];
            
            switch(upgradeType) {
                case 'capacity':
                    this.currentUser.garage.capacity += 5;
                    break;
                case 'lift':
                    this.currentUser.garage.upgrades.lifts += 1;
                    break;
                case 'paintBooth':
                    this.currentUser.garage.upgrades.paintBooth = true;
                    break;
                case 'dyno':
                    this.currentUser.garage.upgrades.dyno = true;
                    break;
                case 'tools':
                    const toolLevels = ['basic', 'professional', 'racing'];
                    const currentLevel = toolLevels.indexOf(this.currentUser.garage.upgrades.toolQuality);
                    if (currentLevel < toolLevels.length - 1) {
                        this.currentUser.garage.upgrades.toolQuality = toolLevels[currentLevel + 1];
                    }
                    break;
            }
            
            this.saveUserData();
            return true;
        }
        
        return false;
    }

    // NFT Integration
    async mintCarNFT(carId) {
        const car = this.getCar(carId);
        
        const nftMetadata = {
            name: `${car.make} ${car.model} #${car.id}`,
            description: `A legendary street racing machine from ARNO DRIVE`,
            image: await this.generateCarImage(car),
            attributes: [
                { trait_type: 'Make', value: car.make },
                { trait_type: 'Model', value: car.model },
                { trait_type: 'Year', value: car.year },
                { trait_type: 'Horsepower', value: car.horsepower },
                { trait_type: 'Class', value: car.class },
                { trait_type: 'Wins', value: car.stats.wins },
                { trait_type: 'Best Time', value: car.stats.bestTime || 'N/A' }
            ]
        };

        // In a real implementation, this would interact with a blockchain
        const nftId = `NFT-${this.generateId()}`;
        car.nftId = nftId;
        
        this.saveCar(car);
        return { nftId, metadata: nftMetadata };
    }

    // Advanced Route System
    createRoute(routeData) {
        return {
            id: this.generateId(),
            name: routeData.name,
            description: routeData.description,
            distance: routeData.distance,
            maxSpeed: routeData.maxSpeed,
            difficulty: routeData.difficulty,
            terrain: routeData.terrain,
            weather: this.getCurrentWeather(),
            checkpoints: this.generateCheckpoints(routeData),
            hazards: this.generateHazards(routeData),
            technicalRating: this.calculateTechnicalRating(routeData),
            brakingZones: routeData.brakingZones || 5,
            elevation: routeData.elevation || 0,
            surface: routeData.surface || 'asphalt'
        };
    }

    generateCheckpoints(routeData) {
        const checkpoints = [];
        const numCheckpoints = Math.floor(routeData.distance / 2);
        
        for (let i = 0; i < numCheckpoints; i++) {
            checkpoints.push({
                id: i + 1,
                distance: (i + 1) * (routeData.distance / numCheckpoints),
                type: i === numCheckpoints - 1 ? 'finish' : 'checkpoint',
                bonusTime: Math.random() * 2
            });
        }
        
        return checkpoints;
    }

    // Crew Management System
    hireCrew() {
        const crewRoles = ['mechanic', 'strategist', 'spotter', 'tuner'];
        const crew = [];
        
        crewRoles.forEach(role => {
            crew.push({
                id: this.generateId(),
                name: this.generateCrewName(),
                role: role,
                skill: Math.floor(Math.random() * 50) + 50,
                experience: 0,
                salary: this.calculateCrewSalary(role),
                morale: 80,
                traits: this.generateCrewTraits()
            });
        });
        
        return crew;
    }

    generateCrewTraits() {
        const allTraits = [
            'Fast Worker', 'Perfectionist', 'Risk Taker', 'Conservative',
            'Innovative', 'Experienced', 'Lucky', 'Unlucky', 'Night Owl',
            'Early Bird', 'Team Player', 'Lone Wolf'
        ];
        
        const numTraits = Math.floor(Math.random() * 3) + 1;
        const traits = [];
        
        for (let i = 0; i < numTraits; i++) {
            const trait = allTraits[Math.floor(Math.random() * allTraits.length)];
            if (!traits.includes(trait)) {
                traits.push(trait);
            }
        }
        
        return traits;
    }

    // Championship System
    createChampionship() {
        return {
            id: this.generateId(),
            name: 'Nairobi Street Kings Championship',
            season: this.getCurrentSeason(),
            races: this.generateChampionshipRaces(),
            standings: [],
            prizes: {
                first: 1000000,
                second: 500000,
                third: 250000,
                participation: 50000
            },
            status: 'upcoming',
            startDate: this.getNextSaturday(),
            endDate: this.getSeasonEnd()
        };
    }

    generateChampionshipRaces() {
        const routes = ['Circuit One', 'Turbo East', 'Night Pulse', 'MegaDrive'];
        const races = [];
        
        for (let i = 0; i < 8; i++) {
            races.push({
                round: i + 1,
                route: routes[i % routes.length],
                date: this.addDays(this.getNextSaturday(), i * 14),
                multiplier: i < 4 ? 1 : 2, // Double points for final rounds
                completed: false
            });
        }
        
        return races;
    }

    // Weather System
    getCurrentWeather() {
        const weatherTypes = [
            { type: 'clear', grip: 1.0, visibility: 1.0 },
            { type: 'cloudy', grip: 1.0, visibility: 0.95 },
            { type: 'light_rain', grip: 0.85, visibility: 0.8 },
            { type: 'heavy_rain', grip: 0.7, visibility: 0.6 },
            { type: 'fog', grip: 0.95, visibility: 0.5 },
            { type: 'night_clear', grip: 0.95, visibility: 0.7 },
            { type: 'night_rain', grip: 0.65, visibility: 0.4 }
        ];
        
        return weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    }

    // Audio System
    initializeAudio() {
        this.sounds = {
            engineStart: new Audio('sounds/engine-start.mp3'),
            acceleration: new Audio('sounds/acceleration.mp3'),
            brake: new Audio('sounds/brake.mp3'),
            drift: new Audio('sounds/drift.mp3'),
            nitrous: new Audio('sounds/nitrous.mp3'),
            crash: new Audio('sounds/crash.mp3'),
            countdown: new Audio('sounds/countdown.mp3'),
            victory: new Audio('sounds/victory.mp3')
        };
        
        // Set volumes
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.5;
        });
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => console.log('Audio play failed:', e));
        }
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateCrewName() {
        const firstNames = ['Marcus', 'Sofia', 'Kamau', 'Aisha', 'David', 'Grace', 'Samuel', 'Faith'];
        const lastNames = ['Mwangi', 'Ochieng', 'Kimani', 'Wanjiru', 'Odhiambo', 'Njoroge', 'Kariuki', 'Mutua'];
        
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }

    getCurrentSeason() {
        const date = new Date();
        return `${date.getFullYear()}-S${Math.floor(date.getMonth() / 3) + 1}`;
    }

    getNextSaturday() {
        const date = new Date();
        const day = date.getDay();
        const daysUntilSaturday = (6 - day + 7) % 7 || 7;
        date.setDate(date.getDate() + daysUntilSaturday);
        date.setHours(20, 0, 0, 0);
        return date;
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    getSeasonEnd() {
        const date = new Date();
        date.setMonth(date.getMonth() + 3);
        return date;
    }

    // Data Management
    saveUserData() {
        localStorage.setItem('arnoDriveUser', JSON.stringify(this.currentUser));
    }

    loadUserData() {
        const savedData = localStorage.getItem('arnoDriveUser');
        if (savedData) {
            this.currentUser = JSON.parse(savedData);
        } else {
            this.createNewUser();
        }
    }

    createNewUser() {
        this.currentUser = {
            id: this.generateId(),
            username: null,
            credits: 100000,
            experience: 0,
            level: 1,
            garage: this.createGarage(),
            crew: [],
            achievements: [],
            statistics: {
                totalRaces: 0,
                wins: 0,
                losses: 0,
                perfectRaces: 0,
                totalEarnings: 0,
                favoriteRoute: null,
                fastestTime: null
            }
        };
    }

    saveCar(car) {
        if (!this.currentUser.garage.cars) {
            this.currentUser.garage.cars = [];
        }
        
        const existingIndex = this.currentUser.garage.cars.findIndex(c => c.id === car.id);
        if (existingIndex !== -1) {
            this.currentUser.garage.cars[existingIndex] = car;
        } else {
            this.currentUser.garage.cars.push(car);
        }
        
        this.saveUserData();
    }

    getCar(carId) {
        return this.currentUser.garage.cars.find(car => car.id === carId);
    }

    // Real-time Updates
    startRealTimeUpdates() {
        // Update countdown timer
        setInterval(() => {
            this.updateRaceCountdown();
        }, 1000);

        // Update leaderboard
        setInterval(() => {
            this.updateLeaderboard();
        }, 5000);

        // Update weather
        setInterval(() => {
            this.updateWeather();
        }, 300000); // Every 5 minutes
    }

    updateRaceCountdown() {
        const nextRace = this.getNextSaturday();
        const now = new Date();
        const timeDiff = nextRace - now;
        
        if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            this.displayCountdown(days, hours, minutes, seconds);
        }
    }

    displayCountdown(days, hours, minutes, seconds) {
        const countdownElement = document.getElementById('race-countdown');
        if (countdownElement) {
            countdownElement.innerHTML = `
                <div class="countdown-item">
                    <div class="countdown-value">${days}</div>
                    <div class="countdown-label">DAYS</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${hours.toString().padStart(2, '0')}</div>
                    <div class="countdown-label">HOURS</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${minutes.toString().padStart(2, '0')}</div>
                    <div class="countdown-label">MINS</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${seconds.toString().padStart(2, '0')}</div>
                    <div class="countdown-label">SECS</div>
                </div>
            `;
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Car registration form
        const carForm = document.getElementById('car-registration-form');
        if (carForm) {
            carForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCarRegistration(e.target);
            });
        }

        // Route selection
        document.querySelectorAll('.route-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectRoute(card.dataset.routeId);
            });
        });

        // Start race button
        const startRaceBtn = document.getElementById('start-race-btn');
        if (startRaceBtn) {
            startRaceBtn.addEventListener('click', () => {
                this.initiateRace();
            });
        }
    }

    handleCarRegistration(form) {
        const formData = new FormData(form);
        const carData = {
            make: formData.get('make'),
            model: formData.get('model'),
            year: parseInt(formData.get('year')),
            horsepower: parseInt(formData.get('horsepower')),
            torque: parseInt(formData.get('torque')),
            weight: parseInt(formData.get('weight'))
        };

        const newCar = this.registerCar(carData);
        this.displayCarRegistrationSuccess(newCar);
        form.reset();
    }

    displayCarRegistrationSuccess(car) {
        const message = `
            🎉 Car Registered Successfully!
            ${car.make} ${car.model} (${car.year})
            Class: ${car.class}
            ID: ${car.id}
        `;
        
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Animation System
    initializeAnimations() {
        this.animateSpeedometer();
        this.animateBackgroundEffects();
        this.setupParallaxScrolling();
    }

    animateSpeedometer() {
        const speedometer = document.getElementById('speedometer');
        if (speedometer) {
            let currentSpeed = 0;
            const targetSpeed = 280;
            
            const animateSpeed = () => {
                if (currentSpeed < targetSpeed) {
                    currentSpeed += 5;
                    speedometer.style.transform = `rotate(${(currentSpeed / 320) * 270 - 135}deg)`;
                    requestAnimationFrame(animateSpeed);
                }
            };
            
            animateSpeed();
        }
    }

    animateBackgroundEffects() {
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-rain';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = '0.1';
        canvas.style.zIndex = '0';
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const matrix = "ARNODRIVERACINGKENYANAIROBISTREET0123456789";
        const matrixArray = matrix.split("");
        
        const fontSize = 10;
        const columns = canvas.width / fontSize;
        
        const drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        
        setInterval(draw, 35);
    }

    setupParallaxScrolling() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.arnoDrive = new ArnoDrive();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArnoDrive;
}
