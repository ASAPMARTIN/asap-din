import { createContext, useContext, useState, useCallback } from 'react';
import { mockBrokers, getBrokerById, searchBrokers as searchBrokersData } from '../data/mockBrokers';

const BrokersContext = createContext(null);

export function BrokersProvider({ children }) {
  const [brokers, setBrokers] = useState(mockBrokers);
  const [userVotes, setUserVotes] = useState({}); // { brokerId_questionKey: answer }

  const searchBrokers = useCallback((query) => {
    return searchBrokersData(query);
  }, []);

  const getBroker = useCallback((id) => {
    return brokers.find(b => b.id === id) || null;
  }, [brokers]);

  const submitVote = useCallback((brokerId, questionKey, answer, paymentDays = null) => {
    const voteKey = `${brokerId}_${questionKey}`;

    setUserVotes(prev => ({ ...prev, [voteKey]: answer }));

    setBrokers(prev => prev.map(broker => {
      if (broker.id !== brokerId) return broker;

      const updated = { ...broker };
      updated.total_poll_votes = (updated.total_poll_votes || 0) + 1;

      if (questionKey === 'pays_on_time') {
        if (answer === 'yes') updated.pays_on_time_yes = (updated.pays_on_time_yes || 0) + 1;
        else if (answer === 'no') updated.pays_on_time_no = (updated.pays_on_time_no || 0) + 1;
        else updated.pays_on_time_sometimes = (updated.pays_on_time_sometimes || 0) + 1;

        if (paymentDays) {
          const total = (updated.pays_on_time_yes || 0) + (updated.pays_on_time_no || 0) + (updated.pays_on_time_sometimes || 0);
          updated.avg_payment_days = Math.round(
            ((updated.avg_payment_days || 30) * (total - 1) + paymentDays) / total
          );
        }

        const yesCount = updated.pays_on_time_yes || 0;
        const total2 = yesCount + (updated.pays_on_time_no || 0) + (updated.pays_on_time_sometimes || 0);
        updated.avg_pays_score = total2 > 0 ? yesCount / total2 : 0;
      }

      if (questionKey === 'rate_accuracy') {
        if (answer === 'yes') updated.rate_accurate_yes = (updated.rate_accurate_yes || 0) + 1;
        else updated.rate_accurate_no = (updated.rate_accurate_no || 0) + 1;
      }

      if (questionKey === 'double_broker') {
        if (answer === 'yes') updated.double_broker_flags = (updated.double_broker_flags || 0) + 1;
      }

      if (questionKey === 'would_use_again') {
        if (answer === 'yes') updated.would_use_again_yes = (updated.would_use_again_yes || 0) + 1;
        else updated.would_use_again_no = (updated.would_use_again_no || 0) + 1;
      }

      return updated;
    }));
  }, []);

  const getUserVote = useCallback((brokerId, questionKey) => {
    return userVotes[`${brokerId}_${questionKey}`] || null;
  }, [userVotes]);

  const addBroker = useCallback((brokerData) => {
    const newBroker = {
      id: `b-user-${Date.now()}`,
      ...brokerData,
      mention_count: 0,
      avg_pays_score: null,
      avg_payment_days: null,
      double_broker_flags: 0,
      total_poll_votes: 0,
      pays_on_time_yes: 0, pays_on_time_no: 0, pays_on_time_sometimes: 0,
      rate_accurate_yes: 0, rate_accurate_no: 0,
      would_use_again_yes: 0, would_use_again_no: 0,
      source: 'user_suggested',
      verified_against_fmcsa: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setBrokers(prev => [newBroker, ...prev]);
    return newBroker;
  }, []);

  return (
    <BrokersContext.Provider value={{
      brokers,
      searchBrokers,
      getBroker,
      submitVote,
      getUserVote,
      addBroker,
    }}>
      {children}
    </BrokersContext.Provider>
  );
}

export function useBrokers() {
  const ctx = useContext(BrokersContext);
  if (!ctx) throw new Error('useBrokers must be used within BrokersProvider');
  return ctx;
}
