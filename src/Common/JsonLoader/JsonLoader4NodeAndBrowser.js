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
	 * Load the data from a json file
	 * @param {String} dataFile The file to load with it's path completed and relative to the position of this file!
	 * @returns {Object} An object with the file content
	 */

	async loadData ( dataFile ) {

		/**
		 * 2025-07 The code below works, but import (..., with {...}) is not known by Rollup...
		 */

		let loadedData = null;
		try {
			const { default : data } = await import ( dataFile, { with : { type : 'json' } } );
			loadedData = data;
			return loadedData;
		}
		catch {
			return loadedData;
		}
	}

	/**
	 * the constructor
	 */

	constructor ( ) {
	}
}

export default JsonLoader;