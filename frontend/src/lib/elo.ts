// Pure Elo rating algorithm
// "Winner" = complaint voted as WORSE (needs more urgent attention) → Elo INCREASES
export function computeElo(
  winnerRating: number,
  loserRating: number,
  K = 32,
): { newWinner: number; newLoser: number } {
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser =
    1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  return {
    newWinner: Math.round(winnerRating + K * (1 - expectedWinner)),
    newLoser: Math.round(loserRating + K * (0 - expectedLoser)),
  };
}
