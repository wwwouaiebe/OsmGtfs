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

import theGtfsPlatforms from '../DataLoading/GtfsPlatforms.js';
import theOsmPlatforms from '../DataLoading/OsmPlatforms.js';
import thePlatformsReport from '../Reports/PlatformsReport.js';
import OsmPlatformValidator from '../OsmValidators/OsmPlatformValidator.js';
import theDocConfig from '../interface/DocConfig.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Performs the comparison betwween osm platforms and gtfs platforms
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class PlatformsComparator {

	/**
	 * Create a list of platforms existing in the gtfs files and not found in osm
	 */

	#searchMissingOsmPlatforms ( ) {
		thePlatformsReport.add ( 'h1', 'Gtfs platforms not found in the osm data' );
		let platformCounter = 0;
		theGtfsPlatforms.platforms.forEach (
			gtfsPlatform => {
				if ( ! theOsmPlatforms.getPlatform ( gtfsPlatform.gtfsRef ) ) {
					thePlatformsReport.add ( 'p', gtfsPlatform.gtfsRef + ' ' + gtfsPlatform.nameOperator );
					platformCounter ++;
				}
			}
		);
		if ( 0 === platformCounter ) {
			thePlatformsReport.add ( 'p', 'Nothing found' );
		}
	}

	/**
	 * Create a list of existing osm platform not found in the gtfs files
	 */

	#searchUnknownGtfsPlatforms ( ) {
		thePlatformsReport.add ( 'h1', 'Osm platforms not found in the gtfs data' );
		let platformCounter = 0;
		theOsmPlatforms.platforms.forEach (
			osmPlatform => {
				if ( ! theGtfsPlatforms.getPlatform ( osmPlatform.gtfsRef ) ) {
					thePlatformsReport.add (
						'p',
						osmPlatform.gtfsRef + ' ' + osmPlatform.name,
						{ id : osmPlatform.osmId, type : osmPlatform.osmType } );
					platformCounter ++;
				}
			}
		);
		if ( 0 === platformCounter ) {
			thePlatformsReport.add ( 'p', 'Nothing found' );
		}
	}

	/**
	 * Report the platforms with more than one ref:tec? (on the same tag or on different tag)
	 */

	#reportOsmPlatformsWithMore1ref ( ) {
		thePlatformsReport.add ( 'h1', 'Osm platforms with more than 1 ref' );
		theOsmPlatforms.platformsWithMore1ref.forEach (
			osmPlatform => {
				let platformText = osmPlatform.name + ' ';
				for ( const [ network, ref ] of Object.entries ( osmPlatform.osmRefs ) ) {
					platformText += network + ' : ' + ref + ' ';
				}
				thePlatformsReport.add ( 'p', platformText, { id : osmPlatform.osmId, type : osmPlatform.osmType } );
			}
		);
	}

	/**
	 * Start the validation of platforms
	 */

	#validatePlatforms ( ) {
		thePlatformsReport.add ( 'h1', 'Platforms validation' );
		theOsmPlatforms.platforms.forEach (
			osmPlatform => {
				const gtfsPlatform = theGtfsPlatforms.platforms.get ( osmPlatform.gtfsRef );
				if ( gtfsPlatform ) {
					new OsmPlatformValidator ( ).validate ( osmPlatform, gtfsPlatform );
				}
			}
		);
	}

	/**
	 * Start the comparison
	 */

	compare ( ) {
		if ( '' !== theDocConfig.ref ) {
			thePlatformsReport.add (
				'h1',
				'No Platforms comparison and validation when the control is limited to a specific route master'
			);
			return;
		}
		this.#searchMissingOsmPlatforms ( );
		this.#searchUnknownGtfsPlatforms ( );
		this.#reportOsmPlatformsWithMore1ref ( );
		this.#validatePlatforms ( );
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default PlatformsComparator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */