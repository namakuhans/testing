async function findUserInGuild(guild, searchTerm) {
  let targetMember = null;
  
  try {
    // Clean search term
    const cleanSearchTerm = searchTerm.trim();
    
    // Check if it's a mention format <@userID>
    if (cleanSearchTerm.includes('<@') && cleanSearchTerm.includes('>')) {
      const userId = cleanSearchTerm.replace(/[<@!>]/g, '').trim();
      if (!isNaN(userId)) {
        targetMember = await guild.members.fetch(userId).catch(() => null);
      }
    }
    
    // Check if it's a direct user ID
    if (!targetMember && !isNaN(cleanSearchTerm) && cleanSearchTerm.length >= 17) {
      targetMember = await guild.members.fetch(cleanSearchTerm).catch(() => null);
    }
    
    // If not found, search by username/displayname
    if (!targetMember) {
      // Search in cached members first
      targetMember = guild.members.cache.find(member => 
        member.user.username.toLowerCase() === cleanSearchTerm.toLowerCase() ||
        member.displayName.toLowerCase() === cleanSearchTerm.toLowerCase() ||
        member.user.tag.toLowerCase() === cleanSearchTerm.toLowerCase() ||
        member.user.globalName?.toLowerCase() === cleanSearchTerm.toLowerCase()
      );
      
      // If still not found, fetch all members and search
      if (!targetMember) {
        try {
          await guild.members.fetch({ limit: 1000, time: 5000 }); // 5 second timeout
        } catch (fetchError) {
          console.log('Could not fetch all members, searching in cache only:', fetchError.message);
        }
        targetMember = guild.members.cache.find(member => 
          member.user.username.toLowerCase() === cleanSearchTerm.toLowerCase() ||
          member.displayName.toLowerCase() === cleanSearchTerm.toLowerCase() ||
          member.user.tag.toLowerCase() === cleanSearchTerm.toLowerCase() ||
          member.user.globalName?.toLowerCase() === cleanSearchTerm.toLowerCase()
        );
      }
    }
  } catch (error) {
    console.log('Error searching for user:', error.message);
  }
  
  return targetMember;
}

module.exports = {
  findUserInGuild
};
