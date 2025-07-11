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
import theOperator from '../Common/Operator.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Base class for the table loading
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class TableLoader {

	/**
	 * The data not loaded during the previous upload
	 * @type {String}
	 */

	#remainingData = '';

	/**
	 * A counter for the lines in the GTFS file
	 * @type {String}
	 */

	#dataLinesCounter;

	/**
	 * The header of the insert sql string
	 * @type {String}
	 */

	#insertSqlStringHeader;

	/**
     * Constant for varchar
     * @type {number}
     */

	// eslint-disable-next-line no-magic-numbers
	static get VARCHAR_LENGHT_10 ( ) { return 10; }

	/**
     * Constant for varchar
     * @type {number}
     */

	// eslint-disable-next-line no-magic-numbers
	static get VARCHAR_LENGHT_64 ( ) { return 64; }

	/**
     * Constant for varchar
     * @type {number}
     */

	// eslint-disable-next-line no-magic-numbers
	static get VARCHAR_LENGHT_256 ( ) { return 256; }

	/**
     * Constant for HIGH_WATER_MARK
     * @type {number}
     */

	// eslint-disable-next-line no-magic-numbers
	static get HIGH_WATER_MARK () { return 2097152; }

	/**
    * A js map for the fields (= objects) of the table
    * @type {Map}
   */

	fieldsMap = new Map ( );

	/**
	 * An array with the fields name
	 * @type {Array}
	 */

	#fieldsList = [];

	/**
     * The constructor
     */

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	 * Get the fields values in a line of the gtfs file.
	 * @param {String} dataLine A line of the gtfs file
	 */

	#getFieldsValues ( dataLine ) {

		// it's complex... field are comma separated, but values can contains a comma...
		// So, first we split the line at the ""
		const tmpFieldsValues = dataLine.split ( '"' );
		let tmpDataLine = '';
		let tmpFieldsValuesCounter = 0;

		// and we replace comma with a dummy text and rebuild the line in a tmp variable
		for ( tmpFieldsValuesCounter = 0; tmpFieldsValuesCounter < tmpFieldsValues.length; tmpFieldsValuesCounter ++ ) {
			if ( 0 !== ( tmpFieldsValuesCounter % 2 ) ) {
				tmpFieldsValues [ tmpFieldsValuesCounter ] =
					tmpFieldsValues [ tmpFieldsValuesCounter ].replaceAll ( ',', 'çççççç' );
			}
			tmpDataLine += tmpFieldsValues [ tmpFieldsValuesCounter ];
		}

		// then we split the tmp variable at the comma
		tmpFieldsValues = tmpDataLine.split ( ',' );

		// and we replace the dummy text with a comma
		for ( tmpFieldsValuesCounter = 0; tmpFieldsValuesCounter < tmpFieldsValues.length; tmpFieldsValuesCounter ++ ) {
			tmpFieldsValues [ tmpFieldsValuesCounter ] =
				tmpFieldsValues [ tmpFieldsValuesCounter ].replaceAll ( 'çççççç', ',' );
		}

		// returning an array with the values
		return tmpFieldsValues;
	}

	/**
     * Crete the first part of the sql insert string
     * @param {string} dataLine
     * @returns {string} the header of the sql
     */

	#setInsertSqlStringHeader ( dataLine ) {
		const fields = dataLine.split ( ',' );
		this.#insertSqlStringHeader = ' INSERT INTO `' + theOperator.mySqlDbName + '`.`' + this.tableName + '` (';
		fields.forEach (
			field => {
				this.#insertSqlStringHeader += '`' + field + '`, ';
				this.#fieldsList.push ( field );
			}
		);
		this.#insertSqlStringHeader = this.#insertSqlStringHeader.slice ( 0, this.#insertSqlStringHeader.length - 2 );
		this.#insertSqlStringHeader += ') VALUES (';
	}

	/**
     * Processig each line of the gtfs file
	 * @param {String} dataLine A line of the gtfs file.
      */

	async #processData ( dataLine ) {

		// No data then return
		if ( ! dataLine || '' === dataLine ) {
			return;
		}

		// first line contains the fields names
		if ( '' === this.#insertSqlStringHeader ) {
			this.#setInsertSqlStringHeader ( dataLine.replaceAll ( '"', '' ) );
			return;
		}

		this.#dataLinesCounter ++;

		// line is splited into fields values
		const fieldValues = this.#getFieldsValues ( dataLine );
		let fieldCounter = 0;
		let insertSqlString = this.#insertSqlStringHeader;

		// adding values to the sql insert string
		fieldValues.forEach (
			fieldValue => {
				const separator =
						'varchar' === this.fieldsMap.get ( this.#fieldsList [ fieldCounter ] ).type
						||
						'time' === this.fieldsMap.get ( this.#fieldsList [ fieldCounter ] ).type
							?
							'\''
							:
							'';

				insertSqlString += separator +
							fieldValue.replaceAll ( '"', '' ).replaceAll ( '\'', '´' ) +
							separator + ', ';
				fieldCounter ++;
			}
		);

		// Finshing the sql insert string
		insertSqlString = insertSqlString.slice ( 0, insertSqlString.length - 2 );
		insertSqlString += ');';

		await theMySqlDb.execSql ( insertSqlString );
	}

	/**
     * Load a block of data
	 * @param {String} partialData Comming soon...
      */

	async #loadPartialData ( partialData ) {

		// Split the data into lines
		const dataArray = partialData.split ( /\r\n|\r|\n/ );

		// Adding remaining data of the previous loop
		dataArray [ 0 ] = this.#remainingData + dataArray [ 0 ];

		// Saving the last line of data (perhaps incomplete...)
		this.#remainingData = dataArray.pop ( );

		// loop on the complete lines
		for ( let dataCounter = 0; dataCounter < dataArray.length; dataCounter ++ ) {
			await this.#processData ( dataArray [ dataCounter ] );
		}

		// commit and message
		await theMySqlDb.execSql ( 'commit;' );

		console.info ( `${this.#dataLinesCounter} records loaded` );
	}

	/**
     * Loading data from the GTFS file
	 * @param {String} fileName The GTFS file name
      */

	async loadData ( fileName ) {

		// init members
		this.#dataLinesCounter = 0;
		this.#insertSqlStringHeader = '';
		this.#remainingData = '';

		// test the existence of the file
		try {
			fs.accessSync ( theOperator.gtfsDirectory + '/' + fileName );
		}
		catch {
			console.info ( `\nFile ${fileName} not found` );
			return;
		}

		console.info ( `\nLoading of file ${fileName} started` );

		// creation of a stream. Remember that some gtfs files are big!
		const readableStream = fs.createReadStream (
			theOperator.gtfsDirectory + '/' + fileName,
			{
				encoding : 'utf8',
				highWaterMark : TableLoader.HIGH_WATER_MARK
			}
		);

		// reading the streem
		await readableStream.forEach (
			async data => await this.#loadPartialData ( data )
		);

		console.info ( `\nLoading of file ${fileName}. ended ${this.#dataLinesCounter} records loaded.` );

	}

	/**
     * Creation of the table
     */

	async createTable ( ) {

		await theMySqlDb.execSql (
			'DROP TABLE if EXISTS ' + this.tableName + ';'
		);
		let createTableSqlString = 'CREATE TABLE IF NOT EXISTS `' + theOperator.mySqlDbName + '`.`' + this.tableName + '` (';
		let indexesString = '';
		let primaryKey = null;
		this.fieldsMap.forEach (
			value => {
				createTableSqlString += '`' + value.name +
					'` ' + value.type + ( ( value.length ) ? '(' + value.length + ') ' : ' ' ) +
					( value.primary ? ' NOT NULL AUTO_INCREMENT' : '' ) +
					( value.collate ? ' CHARACTER SET utf8mb4 COLLATE ' + value.collate : '' ) +
					' ,';
				if ( value.index ) {
					indexesString += 'INDEX `ix_' + value.name + '` (`' + value.name + '`) ,';
				}
				if ( value.primary ) {
					primaryKey = value;
				}
			}
		);
		if ( primaryKey ) {
			createTableSqlString += 'PRIMARY KEY ( `' + primaryKey.name + '`) ,';
		}
		createTableSqlString += indexesString;
		createTableSqlString = createTableSqlString.slice ( 0, createTableSqlString.length - 2 );
		createTableSqlString += ') DEFAULT CHARACTER SET utf8mb4  COLLATE utf8mb4_0900_ai_ci;';

		await theMySqlDb.execSql ( createTableSqlString );

		await this.createIndexes ( );
		console.info ( `\nTable ${this.tableName} created` );
	}
}

export default TableLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */