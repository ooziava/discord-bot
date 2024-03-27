export const formatDuration = (durationInSeconds: number) => {
  try {
    var date = new Date(durationInSeconds * 1000); // Multiply seconds by 1000 to convert to milliseconds
    var hours = ("0" + date.getUTCHours()).slice(-2);
    var minutes = ("0" + date.getUTCMinutes()).slice(-2);
    var seconds = ("0" + date.getUTCSeconds()).slice(-2);
    return hours + ":" + minutes + ":" + seconds;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
