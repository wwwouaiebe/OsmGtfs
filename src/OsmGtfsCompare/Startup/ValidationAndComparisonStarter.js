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

import GtfsDataLoader from '../../OsmGtfsCompare/DataLoading/GtfsDataLoader.js';
import theDocConfig from '../../OsmGtfsCompare/interface/DocConfig.js';
import OsmDataLoader from '../../OsmGtfsCompare/DataLoading/OsmDataLoader.js';
import thePlatformsReport from '../../OsmGtfsCompare/Reports/PlatformsReport.js';
import theStatsReport from '../Reports/StatsReport.js';
import theRelationsReport from '../Reports/RelationsReport.js';
import PlatformsComparator from '../../OsmGtfsCompare/Compare/PlatformsComparator.js';
import RoutesWithoutRouteMasterValidator from '../../OsmGtfsCompare/Compare/RoutesWithoutRouteMasterValidator.js';
import RoutesMasterTreesComparator from '../Compare/RoutesMasterTreesComparator.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Entry point for the validation and the comparison
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class ValidationAndComparisonStarter {

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	 * start the validation and comparison
	 */

	async start ( ) {

		// reset of the Errors only button
		document.getElementById ( 'errorsOnlyInput' ).value = 'Errors only';

		// reading the form
		theDocConfig.loadData ( );

		await new GtfsDataLoader ( ).loadData ( );

		// opening report
		thePlatformsReport.open ( );
		theRelationsReport.open ( );
		theStatsReport.open ( );

		// loading osm data
		await new OsmDataLoader ( ).fetchData (	);

		// Search routes without route_master
		await new RoutesWithoutRouteMasterValidator ( ).fetchData ( );

		new RoutesMasterTreesComparator ( ).compare ( );

		new PlatformsComparator ( ).compare ( );

		// close...
		thePlatformsReport.close ( );
		theRelationsReport.close ( );
		theStatsReport.close ( );

	}
}

export default ValidationAndComparisonStarter;

/* --- End of file --------------------------------------------------------------------------------------------------------- */