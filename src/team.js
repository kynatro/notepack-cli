const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const { isValidNode } = require('./helpers');
const { TEAM_FOLDER, APP_ROOT_FOLDER } = require('./constants');

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
 * @requires notepack/helpers.isValidNode
 * 
 * @return {Array} Array of team members
 */
function getTeamMembers() {
  let teamMembers = [];

  fs.readdirSync(path.resolve(APP_ROOT_FOLDER, TEAM_FOLDER)).forEach((node) => {
    const nodePathname = path.resolve(APP_ROOT_FOLDER, pathScope, node)
    const nodeStats = fs.statSync(nodePathname)
    let teamMember = {};

    if (isValidNode(node) && nodeStats.isDirectory()) {
      teamMember.name = path.basename(nodePathname);
      
      const teamMemberReadmePathname = path.join(nodePathname, 'README.md');

      if (fs.existsSync(teamMemberReadmePathname)) {
        const teamMemberReadme = fs.readFileSync(teamMemberReadmePathname, 'utf8');
        const teamMemberDetails = fm(teamMemberReadme);

        teamMember = {
          ...teamMemberReadme,
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
 * keyed off team member aliases.
 * 
 * @return {Object} Team member aliases
 */
function getTeamMemberAliases() {
  const teamMembers = getTeamMembers();

  return teamMembers.reduce((obj, {name, aliases = []}) => (
    aliases.forEach(alias => obj[alias] = name)
  ), {});
}

/**
 * Get non-reporting team member names
 * 
 * Processes the results of getTeamMembers() and returns an array of team
 * member names that are non-reporting.
 * 
 * @return {Array} Non-reporting team member names
 */
function getNonReportingTeamMemberNames() {
  const teamMembers = getTeamMembers();

  return teamMembers.reduce((arr, { name, isNonReporting }) => (
    isNonReporting && arr.push(name)
  ), []);
}

module.exports = {
  getTeamMembers,
  getTeamMemberAliases,
  getNonReportingTeamMemberNames
};
