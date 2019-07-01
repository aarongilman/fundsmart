import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {

    transform(result: any, searchText: string): any[] {
        if (!result || !searchText) {
            return result;
        }
        return result.filter(results => (results.name.toLowerCase().indexOf(searchText.toLowerCase())
            && results.name.toLowerCase().indexOf(searchText.toLowerCase())) !== -1);
    }

}


