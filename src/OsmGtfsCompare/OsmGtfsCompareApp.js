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

import theVersion from './version.js';
import GoButtonClickEL from './GoButtonClickEL.js';
import AutoStartup from './AutoStartup.js';
import ErrorsOnlyButtonClickEL from './ErrorsOnlyButtonClickEL.js';
import HeadingReportButtonClickEL from './HeadingReportButtonClickEL.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Load the app when opening the HTML page
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmGtfsCompareApp {

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	 * Start the app
	 */

	start ( ) {

		// Adding event listeners on buttons
		document.getElementById ( 'goInput' ).addEventListener ( 'click', new GoButtonClickEL ( ), false );
		document.getElementById ( 'errorsOnlyInput' ).addEventListener ( 'click', new ErrorsOnlyButtonClickEL ( ), false );
		document.getElementById ( 'relationsButton' ).addEventListener (
			'click',
			new HeadingReportButtonClickEL ( 'relationsButton', 'relationsPane' ),
			false
		);
		document.getElementById ( 'platformsButton' ).addEventListener (
			'click',
			new HeadingReportButtonClickEL ( 'platformsButton', 'platformsPane' ),
			false
		);
		document.getElementById ( 'statsButton' ).addEventListener (
			'click',
			new HeadingReportButtonClickEL ( 'statsButton', 'statsPane' ),
			false
		);

		// Adding version
		document.getElementById ( 'version' ).innerText = 'Version: ' + theVersion;

		// Loading the autostartup
		new AutoStartup ( ).start ( );
	}
}

export default OsmGtfsCompareApp;

/* --- End of file --------------------------------------------------------------------------------------------------------- */