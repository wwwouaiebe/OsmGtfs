/*
Copyright - 2024 2025 - wwwouaiebe - Contact: https://www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
/*
Changes:
	- v1.0.0:
		- created
Doc reviewed 20250711
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * A simple enum with the possible values for a MatchScore
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class MatchScoreValues {

	/**
     * the value when all the platforms ref of the lists are the same in the same order.
     * @type {Number}
     */

	static get haveSamePlatforms ( ) { return 3; }

	/**
     * the value when the first and last platforms ref are the same. Others platforms ref can differs.
     * @type {Number}
     */

	static get haveSameFromToPlatforms ( ) { return 2; }

	/**
     * the value when the first and last platforms ref are the same, except the last string.
     * @type {Number}
     */

	static get haveSimilarFromToPlatforms ( ) { return 1; }

	/**
     * the value when the platforms refs differs
     * @type {Number}
     */

	static get haveDifferentPlatforms ( ) { return 0; }
}
export default MatchScoreValues;

/* --- End of file --------------------------------------------------------------------------------------------------------- */