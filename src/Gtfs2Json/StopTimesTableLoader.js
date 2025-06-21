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

import TableLoader from '../Gtfs2Json/TableLoader.js';
import theMySqlDb from '../Gtfs2Json/MySqlDb.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Loader for the 'stop_times' table
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class StopTimesTableLoader extends TableLoader {

	/**
     * The name of the table
     * @type {string}
     */

	get fileName ( ) { return 'stop_times.txt'; }

	/**
     * The name of the table
     * @type {string}
     */

	get tableName ( ) { return 'stop_times'; }

	/**
     * The cosntructor
     */

	constructor ( ) {
		super ( );
		this.fieldsMap.set (
			'stop_pk',
			{
				name : 'stop_pk',
				type : 'int',
				index : true
			}
		);
		this.fieldsMap.set (
			'stop_id',
			{
				name : 'stop_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				collate : 'utf8mb4_0900_as_cs',
				index : true
			}
		);
		this.fieldsMap.set (
			'trip_pk',
			{
				name : 'trip_pk',
				type : 'int',
				index : true
			}
		);
		this.fieldsMap.set (
			'trip_id',
			{
				name : 'trip_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64,
				collate : 'utf8mb4_0900_as_cs',
				index : true
			}
		);
		this.fieldsMap.set (
			'arrival_time',
			{
				name : 'arrival_time',
				type : 'time'
			}
		);
		this.fieldsMap.set (
			'departure_time',
			{
				name : 'departure_time',
				type : 'time'
			}
		);
		this.fieldsMap.set (
			'stop_sequence',
			{
				name : 'stop_sequence',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'stop_headsign',
			{
				name : 'stop_headsign',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'pickup_type',
			{
				name : 'pickup_type',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'drop_off_type',
			{
				name : 'drop_off_type',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'continuous_pickup',
			{
				name : 'continuous_pickup',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'continuous_drop_off',
			{
				name : 'continuous_drop_off',
				type : 'integer'
			}
		);
		this.fieldsMap.set (
			'shape_dist_traveled',
			{
				name : 'shape_dist_traveled',
				type : 'float',
				length : '7,3'
			}
		);
		this.fieldsMap.set (
			'timepoint',
			{
				name : 'timepoint',
				type : 'integer'
			}
		);
		Object.freeze ( this );
	}

	/**
     * Creation of the indexes
     */

	async createIndexes ( ) {
		await theMySqlDb.execSql (
			'create index ix_stop_pk_stop_sequence on stop_times (stop_pk, stop_sequence);'
		);
	}

}

export default StopTimesTableLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */