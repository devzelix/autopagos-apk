import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'negativeAmount'
})
export class NegativeAmountPipe implements PipeTransform {

  transform(value: string): string {
    if( parseFloat(value) < 0 ) {
      return (parseFloat(value)*(-1)).toFixed(2) ;
    }
    return value;
  }

}
