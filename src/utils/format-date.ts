function formatDate(date: number): string {
  const duration = date * 1000;
  return new Date(duration).toISOString().slice(11, 19);
}

export default formatDate;
