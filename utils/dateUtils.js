function createGMT7Timestamp() {
  const now = new Date();
  const gmt7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[gmt7Time.getUTCDay()];
  const date = gmt7Time.getUTCDate();
  const month = months[gmt7Time.getUTCMonth()];
  const year = gmt7Time.getUTCFullYear();
  const hours = gmt7Time.getUTCHours().toString().padStart(2, '0');
  const minutes = gmt7Time.getUTCMinutes().toString().padStart(2, '0');
  const seconds = gmt7Time.getUTCSeconds().toString().padStart(2, '0');
  
  return `LANA | PHANZSTORE! | Creator: ! iHannsy A.K.A MasPakan\nLast Update: ${dayName}, ${date} ${month} ${year} | ${hours}:${minutes}:${seconds} (GMT+7)`;
}

module.exports = {
  createGMT7Timestamp
};