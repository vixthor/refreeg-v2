/**
 * Reward amounts for different events
 */
export const REWARD_AMOUNTS = {
  comment: 50,
  share: 100,
  donation: (amount: number) => Math.floor(amount * 0.1), // 10% of donation amount
  login: 1,
  weekly_streak: 500,
  monthly_active: 1000,
};
