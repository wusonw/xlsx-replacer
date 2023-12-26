# xlsx-replacer

## Description

> This is a project for making `.xlsx` file as a template. With a template xlsx file containing `${slot}` inside and this wonderful `xlsx-repacer` tool , You can get a target xlsx file !

## Installation

```bash
# Using npm
npm install xlsx-replacer --save

# Or
# Using pnpm
pnpm install xlsx-replacer --save
```

## How To Use

```js
//  import it
import { XlsxReplacer } from 'xlsx-replacer'
// or default import
// import XlsxReplacer from 'xlsx-replacer'

const replacer = new XlsxReplacer()

//then you can await the replace method with your option
async function main(){
  const opt = {
    template 'path/to/your/template/xlsx',
    rMap:{}
  }
  await replacer.replace(option)
}
```

replace function option should be set like this:
```ts
export type ReplaceOptions = {
  // template file path
  template: string;

  // replace map object
  rMap: { [k: string]: any };

  // empty slot, default is ${slotName}
  empty?: (slotName: string) => string;

  // whether to override the template instand of create a new file
  override?: boolean;

  // target xlsx output file path, not aviable when override is true,default path is same as template with ! in front
  target?: string;

   // unpacked path, where to generate unpacked,default dir is same as target's 
  unpacked?: string

  // whether to keep unpacked files when replaced
  keepUnpacked?: boolean;
};
```

## Contribution
For now , it's just a basic version for our persion project. You can join the project to make it better if you want.

## LICENSE
[MIT](./LICENSE)
