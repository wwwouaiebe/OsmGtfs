/*
Copyright - 2023 - wwwouaiebe - Contact: https://www.ouaie.be/

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

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Loader for the 'translations' table
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class TranslationsTableLoader extends TableLoader {

	/**
     * The name of the table
     * @type {string}
     */

	get tableName ( ) { return 'translations'; }

	/**
     * The cosntructor
     */

	constructor ( ) {
		super ( );

		// trans_id is not a standard field, but used by stib
		this.fieldsMap.set (
			'trans_id',
			{
				name : 'trans_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);

		// lang is not a standard field, but used by stib
		this.fieldsMap.set (
			'lang',
			{
				name : 'lang',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_10
			}
		);
		this.fieldsMap.set (
			'table_name',
			{
				name : 'table_name',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'field_name',
			{
				name : 'field_name',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'language',
			{
				name : 'language',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_10
			}
		);
		this.fieldsMap.set (
			'translation',
			{
				name : 'translation',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		this.fieldsMap.set (
			'record_id',
			{
				name : 'record_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'record_sub_id',
			{
				name : 'record_sub_id',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_64
			}
		);
		this.fieldsMap.set (
			'field_value',
			{
				name : 'field_value',
				type : 'varchar',
				length : TableLoader.VARCHAR_LENGHT_256
			}
		);
		Object.freeze ( this );
	}

	/**
     * Creation of the indexes
     */

	async createIndexes ( ) {

	}

}

export default TranslationsTableLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */