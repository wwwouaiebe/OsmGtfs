/*
Copyright - 2025 - wwwouaiebe - Contact: https://www.ouaie.be/

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
 * Simple class for loading the contant pf a json file
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class JsonLoader {

	/**
	 * Load the data from a json file aaaaa
	 * @param {String} dataFile The file to load with it's path completed and relative to the position of this file!
	 * @returns {Object} An object with the file content
	 */

	async loadData ( dataFile ) {

		let loadedData = null;

		await fetch ( dataFile )
			.then (
				response => {
					if ( response.ok ) {
						return response.json ( );
					}
					console.error ( String ( response.status ) + ' ' + response.statusText );
				}
			)
			.then (
				jsonResponse => {
					loadedData = jsonResponse;
				}
			)
			.catch (
				err => {
					console.error ( err );
				}
			);

		return loadedData;
	}

	/**
	 * the constructor
	 */

	constructor ( ) {
	}
}

export default JsonLoader;