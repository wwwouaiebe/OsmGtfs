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

import theDocConfg from '../../OsmGtfsCompare/Interface/DocConfig.js';
import theGtfsRoutesMasterTree from '../../OsmGtfsCompare/DataLoading/GtfsRoutesMasterTree.js';
import theGtfsPlatforms from '../../OsmGtfsCompare/DataLoading/GtfsPlatforms.js';
import theStatsReport from '../../OsmGtfsCompare/Reports/StatsReport.js';
import JsonLoader from '../../Common/JsonLoader.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
  * This class load the gtfs data from the gtfs json file to the gtfs route master tree and gtfs platforms collection
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class GtfsDataLoader {

	/**
     * Start the upload of the gtfs data from the json file
     */

	async loadData ( ) {
		let jsonData = await new JsonLoader ( ).loadData (
			'./dataFiles/json/' + theDocConfg.operator + '/gtfsData-' + theDocConfg.network + '.json'
		);

		// Loading data in the route master tree and platforms collection
		theGtfsRoutesMasterTree.setJsonRoutesMaster ( jsonData.routesMasterTree.routesMaster, theDocConfg.gtfsType );
		theGtfsPlatforms.loadData ( jsonData.platforms );
		const startDate = jsonData.startDate;

		theStatsReport.add (
			'h1',
			'GTFS files valid from ' +
			new Date ( startDate )
				.toLocaleDateString (
					'en-BE',
					{
						weekday : 'long',
						year : 'numeric',
						month : 'long',
						day : 'numeric'
					}
				)
		);

		// sort the routes based on the first and last plaform names
		theGtfsRoutesMasterTree.routesMaster.forEach (
			gtfsRouteMaster => {
				gtfsRouteMaster.routes.sort (
					( first, second ) => {
						const firstStartPlatform = theGtfsPlatforms.getPlatform ( first.platforms [ 0 ] ).nameOperator;
						const secondStartPlatform = theGtfsPlatforms.getPlatform ( second.platforms [ 0 ] ).nameOperator;
						const firstLastPlatform =
							theGtfsPlatforms.getPlatform ( first.platforms.slice ( -1 ) [ 0 ] ).nameOperator;
						const secondLastPlatform =
							theGtfsPlatforms.getPlatform ( second.platforms.slice ( -1 ) [ 0 ] ).nameOperator;
						const startCompare = firstStartPlatform.localeCompare ( secondStartPlatform );
						const lastCompare = firstLastPlatform.localeCompare ( secondLastPlatform );

						return 0 === startCompare ? lastCompare : startCompare;
					}
				);
			}
		);

		return true;
	}

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default GtfsDataLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */