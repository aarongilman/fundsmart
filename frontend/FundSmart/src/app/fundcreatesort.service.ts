import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { funds } from './funds';
import { apiresultfundlist } from './apiresult_fundlist';
import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { SortDirection } from './sortable.directive';

interface SearchResult {
  fundlist: funds[];
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

function sort(fundlist: funds[], column: string, direction: string): funds[] {
  if (direction === '') {
    return fundlist;
  } else {
    return [...fundlist].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(fund: funds, term: string, pipe: PipeTransform) {
  return fund.security_name.toLowerCase().includes(term)
    || fund.asset_type.toLocaleLowerCase().includes(term)
    || fund.isin.toLocaleLowerCase().includes(term)
    || pipe.transform(fund.quantity).includes(term);
}

@Injectable({
  providedIn: 'root'
})
export class FundcreatesortService {


  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _funds$ = new BehaviorSubject<funds[]>([]);
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
      this._funds$.next(result.fundlist);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  resetfunds() {

    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      // console.log("result is ====>", result);
      this._funds$.next(result.fundlist);
      this._total$.next(result.total);
    });
    this._search$.next();
  }

  get funds$() { return this._funds$.asObservable(); }
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
    let fundlist = sort(apiresultfundlist, sortColumn, sortDirection);
 
    // 2. filter

    fundlist = fundlist.filter(fund => matches(fund, searchTerm, this.pipe));
    const total = fundlist.length;


    // 3. paginate
    fundlist = fundlist.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ fundlist, total });
  }
}

