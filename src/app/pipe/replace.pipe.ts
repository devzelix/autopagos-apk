import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  transform(valueString: string, strToReplace: string, replacementStr: string): string {
    if (!valueString || ! strToReplace || ! replacementStr) {
      return valueString;
    }

    return valueString.replace(strToReplace, replacementStr);
  }

}
