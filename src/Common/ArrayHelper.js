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
 * Simple methods for array
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class ArrayHelper {

	/**
	 * Compare 2 names for sorting.
	 * Names are splited into a numeric and analphanumric part, the numeric part is completed with
	 * spaces on the left, then compared as string
	 * @param {String} first The first name to compare
	 * @param {String} second The second name to compare
	 * @returns {Number} The result of the comparison. See String.localCompare ( )
	 */

	static compareRouteName ( first, second ) {

		// split the name into the numeric part and the alphanumeric part:
		// numeric part
		const firstPrefix = String ( Number.parseInt ( first ) );
		const secondPrefix = String ( Number.parseInt ( second ) );

		// alpha numeric part
		const firstPostfix = ( first ).replace ( firstPrefix, '' );
		const secondPostfix = ( second ).replace ( secondPrefix, '' );

		// complete the numeric part with spaces on the left and compare
		const result =
			( firstPrefix.padStart ( 5, ' ' ) + firstPostfix )
				.localeCompare ( secondPrefix.padStart ( 5, ' ' ) + secondPostfix );

		return result;
	}

}

export default ArrayHelper;

/* --- End of file --------------------------------------------------------------------------------------------------------- */