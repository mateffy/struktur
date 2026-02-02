<?php

namespace Mateffy\Magic\Extraction\Parsers;

use Illuminate\Support\Collection;
use Mateffy\Magic\Extraction\Slices\RawTextSlice;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\IReader;

class SpreadsheetParser
{
	protected function getExcelReader(string $type): IReader
	{
		$reader = IOFactory::createReader($type);
        $reader->setIgnoreRowsWithNoCells(true);
        $reader->setReadEmptyCells(false);
        $reader->setReadDataOnly(true);

		return $reader;
	}

	protected function getOdsReader(): IReader
	{
		$reader = IOFactory::createReader('Ods');
        $reader->setReadDataOnly(true);

		return $reader;
	}

	protected function getXmlReader(): IReader
	{
		$reader = IOFactory::createReader('Xml');
        $reader->setReadDataOnly(true);

		return $reader;
	}

	/**
	 * This method will chunk a spreadsheet file into text slices so we can pass them to the LLM.
	 * Each slice may contain multiple sheets or just a part of a sheet.
	 *
	 * @return Collection<RawTextSlice>
	 */
	public function convertToTextSlices(string $filename, int $chunkSize = 20000): Collection
	{
		$extension = pathinfo($filename, PATHINFO_EXTENSION);

		$reader = match ($extension) {
			'xlsx' => $this->getExcelReader('Xlsx'),
			'xls' => $this->getExcelReader('Xls'),
			'ods' => $this->getOdsReader(),
			'xml' => $this->getXmlReader(),
			'csv' => IOFactory::createReader('Csv'),
			default => throw new \InvalidArgumentException("Unsupported file type: {$extension}")
		};

        $spreadsheet = $reader->load($filename);

        $chunkCounter = 0;
        $chunks = collect();
        $currentChunk = collect();

        $wrapChunk = function () use (&$chunks, &$currentChunk, &$chunkCounter) {
            if ($currentChunk->isNotEmpty()) {
                $chunks->push($currentChunk);
                $currentChunk = collect();
                $chunkCounter = 0;
            }
        };

        foreach ($spreadsheet->getAllSheets() as $spreadsheet_sheet) {
            $sheetName = $spreadsheet_sheet->getTitle();
            $sheetData = collect();

			// We cannot get the actual header of the sheet. So, we just get the first 4 rows and hope that one of them is the header.
			// We then include this header in each chunk as context for the data.
			$possible_header_rows = $spreadsheet_sheet->rangeToArray('A1:Z4', reduceArrays: true);

            foreach ($spreadsheet_sheet->getRowIterator() as $rowIndex => $row) {
                $row_data = collect();

                if ($row->isEmpty()) {
                    continue;
                }



                foreach ($row->getCellIterator(iterateOnlyExistingCells: true) as $cell) {
                    /** @var Cell $cell */
                    $value = $cell->getFormattedValue();
                    $chunkCounter += strlen($value);
                    $row_data->push($value);
                }

                $sheetData->push([
                    'row' => $rowIndex + 1, // Row numbers are 1-based
                    'cells' => $row_data->toArray()
                ]);

                if ($chunkCounter > $chunkSize) {
                    $currentChunk->push(new RawTextSlice(
						text: json_encode([
							'sheet' => $sheetName,
							// We give the LLM the first few rows of the sheet as context for the data as this part of the sheet is most likely the header.
							'firstFewSheetRows' => $possible_header_rows,
							'startRow' => $sheetData->first()['row'],
							'endRow' => $sheetData->last()['row'],
							'data' => $sheetData
								->pluck('cells')
								->toArray()
						])
					));
                    $wrapChunk();
                    $sheetData = collect(); // Reset sheet data for the next chunk
                }
            }

            // Add any remaining sheet data to the current chunk
            if ($sheetData->isNotEmpty()) {
                $currentChunk->push(new RawTextSlice(
					text: json_encode([
						'sheet' => $sheetName,
						// We give the LLM the first few rows of the sheet as context for the data as this part of the sheet is most likely the header.
						'firstFewSheetRows' => $possible_header_rows,
						'startRow' => $sheetData->first()['row'],
						'endRow' => $sheetData->last()['row'],
						'data' => $sheetData
							->pluck('cells')
							->toArray()
					])
				));
            }
        }

        $wrapChunk(); // Wrap any remaining data in the last chunk

		return $chunks->flatten(1);
	}
}