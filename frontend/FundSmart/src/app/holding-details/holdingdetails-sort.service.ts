import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { holdindDetail } from './holdingDetail';
import { holdingList } from './holdingList';
import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { SortDirection } from '../sortable.directive';



interface SearchResult {
  holdinglist: holdindDetail[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

function compare(v1, v2) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

function sort(holdinglist: holdindDetail[], column: string, direction: string): holdindDetail[] {
  if (direction === '') {
    return holdinglist;
  } else {
    return [...holdinglist].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(holding: holdindDetail, term: string, pipe: PipeTransform) {
  return holding.security.toLowerCase().includes(term)
    || holding.isin.toLocaleLowerCase().includes(term)
    // || holding.rating.toLocaleLowerCase().includes(term)
    || holding.asset_class.toLocaleLowerCase().includes(term)
    // || pipe.transform(holding.basic_price).includes(term)
    // || pipe.transform(holding.basis).includes(term)
    // || holding.country.toLocaleLowerCase().includes(term)
    // || holding.currency.toLocaleLowerCase().includes(term)
    // || pipe.transform(holding.current_price).includes(term)
    // || holding.industry.toLocaleLowerCase().includes(term)
    // || pipe.transform(holding.market_value).includes(term)
    || holding.portfolio.toLocaleLowerCase().includes(term)
    || holding.quantity.toLocaleLowerCase().includes(term);
    // || holding.ticker.toLocaleLowerCase().includes(term);
}

@Injectable({
  providedIn: 'root'
})
export class HoldingdetailsSortService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _holdings$ = new BehaviorSubject<holdindDetail[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private pipe: DecimalPipe) {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._holdings$.next(result.holdinglist);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  resetHoldingDetails() {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      // console.log("result is ====>", result);
      this._holdings$.next(result.holdinglist);
      this._total$.next(result.total);
    });
    this._search$.next();
  }

  get hlist$() { return this._holdings$.asObservable(); }
  get total$() { return this._total$; }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({ page }); }
  set pageSize(pageSize: number) { this._set({ pageSize }); }
  set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
  set sortColumn(sortColumn: string) { this._set({ sortColumn }); }
  set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

    // 1. sort
    let holdinglist = sort(holdingList, sortColumn, sortDirection);
    // 2. filter
    holdinglist = holdinglist.filter(holding =>
      matches(holding, searchTerm, this.pipe)
    );
    const total = holdinglist.length;

    // 3. paginate
    holdinglist = holdinglist.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ holdinglist, total });
  }
}
