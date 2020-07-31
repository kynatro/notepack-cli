const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const { isValidNode } = require('./helpers');
const { TEAM_FOLDER, APP_ROOT_FOLDER } = require('./userConfig').getUserConfig();

/**
 * Format an alias
 * 
 * Formats an alias for easier discovery. Replaces spaces with periods for
 * predictable @mention identification and makes lowercase to remove case
 * sensitivity matching.
 * 
 * @param {String} alias Alias to format
 */
function formatAlias(alias) {
  return alias.replace(/\s/gi, '.').toLowerCase();
}

/**
 * Get team members
 * 
 * Iterates the TEAM_FOLDER sub-folders as team member folders and builds an
 * array of details about team members. Uses the name of the folder as the
 * team member name and reads the front-matter of the README.md contained in
 * the individual team member folder's root for additional details such as
 * aliases and if the individual is not a reporting team member.
 * 
 * @requires fm
 * @requires fs
 * @requires path
 * @requires notepack-cli/helpers.isValidNode
 * 
 * @return {Array} Array of team members
 */
function getTeamMembers() {
  let teamMembers = [];
  const teamFolderPath = path.resolve(APP_ROOT_FOLDER, TEAM_FOLDER);

  fs.readdirSync(teamFolderPath).forEach((node) => {
    const nodePathname = path.resolve(teamFolderPath, node);
    const nodeStats = fs.statSync(nodePathname);
    let teamMember = {};

    if (isValidNode(node) && nodeStats.isDirectory()) {
      teamMember.name = path.basename(nodePathname);
      
      const teamMemberReadmePathname = path.join(nodePathname, 'README.md');

      if (fs.existsSync(teamMemberReadmePathname)) {
        const teamMemberReadme = fs.readFileSync(teamMemberReadmePathname, 'utf8');
        const teamMemberDetails = fm(teamMemberReadme);

        teamMember = {
          ...teamMember,
          ...teamMemberDetails.attributes
        }
      }

      teamMembers.push(teamMember);
    }
  });

  return teamMembers;
}

/**
 * Get team member aliases
 * 
 * Processes the results of getTeamMembers() and returns an object of aliases
 * keyed off team member aliases. Automatically aliases for dot-concatenated
 * variants of team member names (e.g. FirstName.LastName).
 * 
 * @return {Object} Team member aliases
 */
function getTeamMemberAliases() {
  const teamMembers = getTeamMembers();

  return teamMembers.reduce((obj, {name, aliases = []}) => {
    aliases.forEach(alias => obj[formatAlias(alias)] = name);
    obj[formatAlias(name)] = name;
    return obj;
  }, {});
}

module.exports = {
  formatAlias,
  getTeamMembers,
  getTeamMemberAliases
};
