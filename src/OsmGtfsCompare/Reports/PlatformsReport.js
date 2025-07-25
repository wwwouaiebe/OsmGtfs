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
Doc reviewed 20250124
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import Report from '../../OsmGtfsCompare/Reports/Report.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * The platforms report
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class PlatformsReport extends Report {

	/**
	 * The constructor
	 */

	constructor ( ) {
		super ( );
		this.report = document.getElementById ( 'platformsPane' );
		Object.freeze ( this );
	}
}

/**
 * The one and only one object PlatformsReport
 * @type {PlatformsReport}
 */

const thePlatformsReport = new PlatformsReport;

export default thePlatformsReport;

/* --- End of file --------------------------------------------------------------------------------------------------------- */