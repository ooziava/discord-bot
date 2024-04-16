function formatDate(date: number): string {
  const duration = date * 1000;
  return duration ? new Date(duration).toISOString().slice(11, 19) : "live";
}

export default formatDate;
