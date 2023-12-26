import extract from 'extract-zip';
import JSZip from 'jszip';
import { resolve, basename, join, relative, dirname } from 'path';
import { readdirSync, statSync, readFileSync, writeFileSync, rmSync } from 'fs';

export type ReplaceOptions = {
  // template file path
  template: string;

  // replace map object
  rMap: { [k: string]: any };

  // empty slot, default is ${slotName}
  empty?: (slotName: string) => string;

  // whether to override the template instand of create a new file
  override?: boolean;

  // target xlsx output file path, not aviable when override is true
  target?: string;

  // unpacked path, whether to generate unpacked
  unpacked?: string

  // whether to keep unpacked files when replaced
  keepUnpacked?: boolean;
};


export class XlsxReplacer {
  private zip: JSZip;

  constructor() {
    this.zip = new JSZip();
  }

  private async unpack(templatePath: string, unpackedPath: string) {
    const unpacked = resolve(unpackedPath);
    const template = resolve(templatePath);
    await extract(template, { dir: unpacked });
  }

  private async pack(unpackedPath: string, targetPath: string) {
    async function addDirectoryToZip(zip: JSZip, directoryPath: string, rootDirectory: string) {
      const files = readdirSync(directoryPath);

      for (const file of files) {
        const filePath = join(directoryPath, file);
        const relativePath = relative(rootDirectory, filePath);

        if (statSync(filePath).isDirectory()) {
          const nestedZip = zip.folder(relativePath);
          await addDirectoryToZip(nestedZip!, filePath, filePath);
        } else {
          zip.file(relativePath, readFileSync(filePath));
        }
      }
    }

    await addDirectoryToZip(this.zip, unpackedPath, unpackedPath);
    const zipBuffer = await this.zip.generateAsync({ type: 'nodebuffer' });
    writeFileSync(resolve(targetPath), zipBuffer);
  }

  async replace(opt: ReplaceOptions) {
    const defaultTarget = join(dirname(opt.template), `!${basename(opt.template)}`);
    const target = resolve(opt.override ? opt.template : opt.target || defaultTarget);
    const unpacked = opt.unpacked ?? join(dirname(target), `!unpacked[${basename(opt.template)}-${Date.now()}]`);
    await this.unpack(opt.template, unpacked);

    const mapXMLPath = join(unpacked, 'xl/sharedStrings.xml');
    const sharedStrings = readFileSync(mapXMLPath, 'utf-8');
    const output = sharedStrings.replace(/<t>.*?\$\{.*?\}.*?<\/t>/g, matchStr => {
      return matchStr.replace(/\$\{.*?\}/g, slot => {
        const slotName = slot.slice(2, -1);
        if (opt.rMap && slotName in opt.rMap) {
          const slotValue = opt.rMap[slotName];
          return slotValue;
        }
        return opt.empty?.(slotName) || slot;
      });
    });

    writeFileSync(mapXMLPath, output);

    await this.pack(unpacked, target);

    if (!opt.keepUnpacked) {
      rmSync(unpacked, { recursive: true, force: true });
    }
  }
}
