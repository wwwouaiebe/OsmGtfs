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

import fs from 'fs';

import theMySqlDb from '../Gtfs2Json/MySqlDb.js';
import AgencyTableLoader from '../Gtfs2Json/AgencyTableLoader.js';
import CalendarDatesTableLoader from '../Gtfs2Json/CalendarDatesTableLoader.js';
import CalendarTableLoader from '../Gtfs2Json/CalendarTableLoader.js';
import FeedInfoTableLoader from '../Gtfs2Json/FeedInfoTableLoader.js';
import RouteTableLoader from '../Gtfs2Json/RoutesTableLoader.js';
import ShapesTableLoader from '../Gtfs2Json/ShapesTableLoader.js';
import StopsTableLoader from '../Gtfs2Json/StopsTableLoader.js';
import StopTimesTableLoader from '../Gtfs2Json/StopTimesTableLoader.js';
import TranslationsTableLoader from '../Gtfs2Json/TranslationsTableLoader.js';
import TripsTableLoader from '../Gtfs2Json/TripsTableLoader.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Loader for the gtfs data
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class GtfsLoader {

	/**
     * the 'agency' table loader
	 * @type {Object}
     */

	#agencyTableLoader;

	/**
     * the 'calendar_dates' table loader
	 * @type {Object}
     */

	#calendarDatesTableLoader;

	/**
     * the 'calendar' table loader
	 * @type {Object}
     */

	#calendarTableLoader;

	/**
     * the 'feed_info' table loader
	 * @type {Object}
     */

	#feedInfoTableLoader;

	/**
     * the 'route' table loader
	 * @type {Object}
     */

	#routeTableLoader;

	/**
     * the 'shapes' table loader
	 * @type {Object}
     */

	#shapesTableLoader;

	/**
     * the 'stops' table loader
	 * @type {Object}
     */

	#stopsTableLoader;

	/**
     * the 'stop_times' table loader
	 * @type {Object}
     */

	#stopTimesTableLoader;

	/**
     * the 'translations' table loader
	 * @type {Object}
     */

	#translationsTableLoader;

	/**
     * the 'trips' table loader
	 * @type {Object}
     */

	#tripsTableLoader;

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
		this.#agencyTableLoader = new AgencyTableLoader ( );
		this.#calendarDatesTableLoader = new CalendarDatesTableLoader ( );
		this.#calendarTableLoader = new CalendarTableLoader ( );
		this.#feedInfoTableLoader = new FeedInfoTableLoader ( );
		this.#routeTableLoader = new RouteTableLoader ( );
		this.#shapesTableLoader = new ShapesTableLoader ( );
		this.#stopsTableLoader = new StopsTableLoader ( );
		this.#stopTimesTableLoader = new StopTimesTableLoader ( );
		this.#translationsTableLoader = new TranslationsTableLoader ( );
		this.#tripsTableLoader = new TripsTableLoader ( );
	}

	/**
     * Creation of temporary tables for primary keys and indexes
     */

	async #createTablesPk ( ) {

		console.info ( '\nCreation of tables for PK started...' );

		// services
		await theMySqlDb.execSql (
			'DROP TABLE if EXISTS services_pk;'
		);
		await theMySqlDb.execSql (
			'CREATE TABLE services_pk ( ' +
				'service_pk int NOT NULL AUTO_INCREMENT, ' +
				'service_id varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs NOT NULL , ' +
				'PRIMARY KEY (service_pk) );'
		);
		await theMySqlDb.execSql (
			'create index ix_service_id on services_pk (service_id ); '
		);

		// Shapes
		await theMySqlDb.execSql (
			'DROP TABLE if EXISTS shapes_pk;'
		);
		await theMySqlDb.execSql (
			'CREATE TABLE shapes_pk ( ' +
			'shape_pk int NOT NULL AUTO_INCREMENT, ' +
			'shape_id varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs  NOT NULL, ' +
			'PRIMARY KEY (shape_pk) );'
		);
		await theMySqlDb.execSql (
			'create index ix_shape_id on shapes_pk (shape_id ); '
		);

		console.info ( '\nCreation of tables for PK ended...' );
	}

	/**
     * Creation of the views
     */

	async #createViews ( ) {
		let calendarFileExists = true;
		try {
			fs.accessSync ( theOperator.gtfsDirectory + '/calendar.txt' );
		}
		catch {
			calendarFileExists = false;
		}

		await theMySqlDb.execSql (
			'DROP VIEW if exists `shapes_for_route`;'
		);

		if ( calendarFileExists ) {
			await theMySqlDb.execSql (
				'create view shapes_for_route as ' +
				'select min(start_date) as minStartDate, max(end_date) as maxEndDate, ' +
				'route_pk as routePk, shape_pk as shapePk ' +
				'from ( ' +
					'select distinct ' +
					'calendar.start_date, ' +
					'calendar.end_date, ' +
					'routes.route_pk, trips.shape_pk ' +
					'FROM ' +
					'routes ' +
					'inner join trips on routes.route_pk = trips.route_pk ' +
					'inner join calendar on trips.service_pk = calendar.service_pk ' +
				') t ' +
				' group by shapePk order by minStartDate, maxEndDate;'
			);
		}
		else {
			await theMySqlDb.execSql (
				'create view shapes_for_route as ' +
				'select min(start_date) as minStartDate, max(end_date) as maxEndDate, ' +
				'route_pk as routePk, shape_pk as shapePk ' +
				'from ( ' +
					'select ' +
					'(select min(feed_start_date) from feed_info) as start_date, ' +
					'(select min(feed_end_date) from feed_info) as end_date, ' +
					'routes.route_pk, trips.shape_pk ' +
					'FROM ' +
					'routes ' +
					'inner join trips on routes.route_pk = trips.route_pk' +
				') t ' +
				'group by shapePk'
			);
		}

	}

	/**
     * Complete the tables with the primary keys
     */

	async #loadPk ( ) {
		console.info ( '\nLoading of PK started...' );

		// routes table
		console.info ( '\nfor routes...' );
		await theMySqlDb.execSql (
			'update routes set routes.agency_pk = ' +
			'( select agency.agency_pk from agency where agency.agency_id = routes.agency_id);'
		);

		// trips table
		console.info ( '\nfor trips...' );
		await theMySqlDb.execSql (
			'update trips set trips.route_pk = ' +
			'(select route_pk from routes where routes.route_id = trips.route_id);'
		);

		// stop_times table
		console.info ( '\nfor stop_times...' );
		await theMySqlDb.execSql (
			'update stop_times set stop_times.stop_pk = ' +
			'( select stop_pk from stops where stops.stop_id = stop_times.stop_id );'
		);
		await theMySqlDb.execSql (
			'update stop_times set stop_times.trip_pk = ' +
			'( select trip_pk from trips where trips.trip_id = stop_times.trip_id );'
		);

		// calendar table
		console.info ( '\nfor calendar...' );
		await theMySqlDb.execSql (
			'update calendar set calendar.service_pk = ' +
			'(select services_pk.service_pk from services_pk where services_pk.service_id = calendar.service_id );'
		);

		// calendar_dates table
		console.info ( '\nfor calendar_dates...' );
		await theMySqlDb.execSql (
			'update calendar_dates set calendar_dates.service_pk = ' +
			'(select services_pk.service_pk from services_pk where services_pk.service_id = calendar_dates.service_id );'
		);

		// shapes table
		console.info ( '\nfor shapes...' );
		await theMySqlDb.execSql (
			'update shapes set shapes.shape_pk = ' +
			'(select shapes_pk.shape_pk from shapes_pk where shapes_pk.shape_id = shapes.shape_id );'
		);

		// trips table
		console.info ( '\nfor trips...' );
		await theMySqlDb.execSql (
			'update trips set trips.service_pk = ' +
			'(select services_pk.service_pk from services_pk where services_pk.service_id = trips.service_id );'
		);
		await theMySqlDb.execSql (
			'update trips set trips.shape_pk = ' +
			'(select shapes_pk .shape_pk from shapes_pk where shapes_pk.shape_id = trips.shape_id );'
		);

		console.info ( '\nLoading of PK ended...' );
	}

	/**
     * Loading of temp tables with primary keys
     */

	async #loadTablesPk ( ) {

		console.info ( '\nLoading of tables PK started...' );

		await theMySqlDb.execSql (
			'insert into services_pk (service_id ) select distinct service_id from ( ' +
				'select trips.service_id from trips union ' +
				'select calendar.service_id from calendar union ' +
				'select calendar_dates.service_id from calendar_dates ' +
			') t order by service_id;'
		);

		await theMySqlDb.execSql (
			'insert into shapes_pk (shape_id) select DISTINCT shape_id from shapes;'
		);
		console.info ( '\nLoading of tables PK ended...' );
	}

	/**
     * create the tables in the db
     */

	async #createTables ( ) {
		await this.#agencyTableLoader.createTable ( );
		await this.#calendarDatesTableLoader.createTable ( );
		await this.#calendarTableLoader.createTable ( );
		await this.#feedInfoTableLoader.createTable ( );
		await this.#routeTableLoader.createTable ( );
		await this.#shapesTableLoader.createTable ( );
		await this.#stopsTableLoader.createTable ( );
		await this.#stopTimesTableLoader.createTable ( );
		await this.#translationsTableLoader.createTable ( );
		await this.#tripsTableLoader.createTable ( );
	}

	/**
     * Load the GTFS files into the db
     */

	async #loadData ( ) {

		await this.#agencyTableLoader.loadData ( 'agency.txt' );
		await this.#calendarDatesTableLoader.loadData ( 'calendar_dates.txt' );
		await this.#calendarTableLoader.loadData ( 'calendar.txt' );
		await this.#feedInfoTableLoader.loadData ( 'feed_info.txt' );
		await this.#routeTableLoader.loadData ( 'routes.txt' );
		await this.#shapesTableLoader.loadData ( 'shapes.txt' );
		await this.#stopsTableLoader.loadData ( 'stops.txt' );
		await this.#stopTimesTableLoader.loadData ( 'stop_times.txt' );
		await this.#translationsTableLoader.loadData ( 'translations.txt' );
		await this.#tripsTableLoader.loadData ( 'trips.txt' );

	}

	/**
     * Start the upload of the gtfs
     */

	async start ( ) {

		theMySqlDb.execSql (
			'DROP VIEW if exists lat_lon_for_shape, routes_for_agency, shapes_for_route;'
		);

		await this.#createTables ( );

		await this.#createTablesPk ( );

		await this.#createViews ( );

		await this.#loadData ( );

		await theMySqlDb.execSql (
			'update routes set agency_id = \'STIB-MIVB\' where agency_id is null;'
		);

		await this.#loadTablesPk ( );

		await this.#loadPk ( );

		await theMySqlDb.execSql ( 'DROP TABLE `services_pk`, `shapes_pk`;' );

	}
}

export default GtfsLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */