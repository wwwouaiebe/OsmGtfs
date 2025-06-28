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
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import theDocConfg from '../OsmGtfsCompare/DocConfig.js';
import theGtfsRoutesMasterTree from '../OsmGtfsCompare/GtfsRoutesMasterTree.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Loader for the gtfs data
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class Json2GtfsLoader {

	/**
     * Start the upload of the gtfs data from the json file
     */

	async loadData ( ) {

		try {
			const { default : jsonsData } = await import (
				'../../json/' + theDocConfg.operator + '/gtfsData-' + theDocConfg.network + '.json',
				{ with : { type : 'json' } }
			);

			theGtfsRoutesMasterTree.buildFromJson ( jsonsData.routesMasterTree );
			return true;
		}
		catch {
			return false;
		}
	}

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default Json2GtfsLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */