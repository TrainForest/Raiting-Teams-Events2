import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import * as fs from 'fs';
import { Event } from 'src/events/entities/event.entity';
import { Workbook } from 'exceljs';
import { Response } from 'express';

@Injectable()
export class UploadsService {
  // загрузить файл на сервер по указанному началу пути юрл
  async uploadFile(startPathUrl: string, file: Express.Multer.File) {
    const pathToSave = 'public/media';

    let fullPath = '';
    let fullURL = '';
    // если буфер не пустой
    if (file.buffer != null) {
      // сгенерировать уникальное имя
      let filename = this.generateUniqueFileName();

      if (file.originalname) {
        // const fileExtension = file.originalname.split('.').pop();
        filename += file.originalname;
      }

      const currentDate = new Date(); // Use the current date
      // сгенерировать путь к папке (год, месяц)
      const pathToFolder = this.generateFoldersYearMonthDay(
        currentDate,
        `./${pathToSave}`,
      );

      fullPath = `./${pathToSave}/${pathToFolder}/${filename}`;
      fullURL = `${startPathUrl}/${pathToSave}/${pathToFolder}/${filename}`;

      const stream = createWriteStream(fullPath);
      stream.write(file.buffer);
      stream.end();
    } else {
      throw new HttpException('Буфер файла пустой', HttpStatus.BAD_REQUEST);
    }

    return fullURL;
  }

  // generators---------------------------------------------------------------------------------
  //генерирует уникальное имя для файла на основе даты
  private generateUniqueFileName() {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string of 6 characters

    return `${timestamp}_${randomString}`;
  }

  // сгенерировать папку год.месяц и подпапку дня
  private generateFoldersYearMonthDay(date: Date, pathStart: string) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month ranges from 0 to 11, so add 1 and pad with leading zero if necessary
    const folderDay = date.getDate().toString().padStart(2, '0'); // Pad day with leading zero if necessary

    const folderYearMonth = `${year}.${month}`;
    const pathToFolderDay = `${folderYearMonth}/${folderDay}`;

    this.createFolderIfNotExists(`${pathStart}/${folderYearMonth}`);

    const fullpath = `${pathStart}/${pathToFolderDay}`;

    this.createFolderIfNotExists(fullpath);

    return pathToFolderDay;
  }

  // проверить существование папки и создать, если не существует
  private createFolderIfNotExists(path: string) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
      console.log(`Folder created: ${path}`);
      return true;
    } else {
      // console.log(`Folder already exists: ${path}`);
      return false;
    }
  }
  // generators---------------------------------------------------------------------------------

  async deleteFileByUrl(pathURL: string) {
    const startPath = '/public/media';
    const deleted = true;
    let httpError: HttpException = null;

    try {
      const url = new URL(pathURL);

      const pathServer = `.${url.pathname}`;

      // need check correct path for preventing some bad api requests
      if (url.pathname.startsWith(startPath)) {
        await new Promise<void>((resolve, reject) => {
          fs.unlink(pathServer, (err) => {
            if (err) {
              // console.error('Error deleting file:');
              reject(err);
            } else {
              // console.log('File deleted successfully.');
              resolve();
            }
          });
        });
      } else {
        httpError = new HttpException(
          'Ошибка удаления файла, путь для удаления с сервера должен начинаться с ' +
            startPath,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      httpError = new HttpException(error.code, HttpStatus.BAD_REQUEST, {
        cause: new Error('Неверно введен URL'),
      });
    }

    if (httpError) throw httpError;

    return deleted;
  }

  async getFileBuffer(path: string) {
    let buffer: Buffer = null;
    // проверить существование файла
    if (fs.existsSync(path)) {
      buffer = fs.readFileSync(path);
    } else {
      throw new HttpException('Путь не найден', HttpStatus.BAD_REQUEST);
    }

    return buffer;
  }

  // async getFileImageBase64(path: string) {

  //   let buffer = await this.getFileBuffer(path)

  //   return this.convertToBase64(buffer)
  // }

  async convertToBase64(buffer: Buffer) {
    return buffer.toString('base64');
  }

  // install excel file for events in direction
  async getReportEvents(res: Response, events: Event[]) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'report_file.xlsx',
    );

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('мероприятия');
    worksheet.columns = [
      { header: 'название', key: 'name', width: 25 },
      { header: 'уровень', key: 'level', width: 15 },
      { header: 'тип', key: 'type', width: 15 },
      { header: 'формат', key: 'format', width: 15 },
      { header: 'дата начала', key: 'startDate', width: 15 },
      { header: 'дата конца', key: 'endDate', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };

    // Add some data to the worksheet

    let indexRow = 1;
    for (const i in events) {
      const e = events[i];
      const arrData = [];

      arrData.push(
        e.title ?? '-',
        e.level ? e.level.name : '-',
        e.type ? e.type.name : '-',
        e.format ? e.format.name : '-',
        e.dateStart,
        e.dateEnd,
      );

      worksheet.getRow(indexRow).getCell(1).alignment = { wrapText: true };
      worksheet.addRow(arrData);

      indexRow++;
    }

    await workbook.xlsx.write(res);
    res.end();
  }
}
