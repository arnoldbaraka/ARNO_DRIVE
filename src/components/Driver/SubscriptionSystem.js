import React, { useState, useEffect } from 'react';
import { db, auth } from '../../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
export default function SubscriptionSystem({ driverId }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (!user) return;
    // Check if user is subscribed
    const checkSubscription = async () => {
      const subRef = doc(db, `users/${user.uid}/subscriptions`, driverId);
      const subSnap = await getDoc(subRef);
      setIsSubscribed(subSnap.exists());
    };
    checkSubscription();
  }, [user, driverId]);
  useEffect(() => {
    // Load subscriber count
    const countRef = doc(db, `drivers/${driverId}`, 'counters', 'subscribers');
    const unsubscribe = onSnapshot(countRef, (doc) => {
      if (doc.exists()) {
        setSubscriberCount(doc.data().count);
      }
    });
    return unsubscribe;
  }, [driverId]);
  const handleSubscribe = async () => {
    if (!user) {
      alert('Please sign in to subscribe!');
      return;
    }
    const userRef = doc(db, `users/${user.uid}/subscriptions`, driverId);
    const driverRef = doc(db, `drivers/${driverId}`, 'counters', 'subscribers');
    const countRef = doc(db, `drivers/${driverId}`, 'counters', 'subscribers');
    if (isSubscribed) {
      // Unsubscribe
      await setDoc(userRef, {});
      await setDoc(countRef, { count: subscriberCount - 1 }, { merge: true });
      setIsSubscribed(false);
    } else {
      // Subscribe
      await setDoc(userRef, { subscribedAt: new Date() });
      await setDoc(countRef, { count: subscriberCount + 1 }, { merge: true });
      setIsSubscribed(true);
    }
  };
  return (
    <div className="subscription-widget">
      <button 
        onClick={handleSubscribe}
        className={`holographic-btn ${isSubscribed ? 'subscribed' : ''}`}
      >
        {isSubscribed ? 'UNSUBSCRIBE' : 'SUBSCRIBE'}
      </button>
      <div className="sub-count">
        <i className="icon-users"></i> {subscriberCount} subscribers
      </div>
    </div>
  );
}