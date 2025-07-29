require('dotenv').config();
const cleanupOrphanedData = require('./cleanupOrphanedData');

console.log('Starting orphaned data cleanup...');
cleanupOrphanedData()
  .then(() => {
    console.log('Cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }); 