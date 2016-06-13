import {Component, Input, Pipe, PipeTransform, AfterViewInit, OnChanges, SimpleChange, Output, EventEmitter} from '@angular/core';
import {NgFor, NgStyle, NgClass, NgIf} from '@angular/common';

export interface GridColumn {
    name: string;
    caption?: string;
    dataType?: string;
    width?: number,
    sortable?: boolean;
    sortDesc?: boolean;
    filterable?: boolean;
    filter?: string;
    align?: string;
}

export interface GridOptions {
    pageable?: boolean;
    pageSize?: number;
    tableStriped?: boolean;
    tableHover?: boolean;
    showEvents?: boolean;
}

@Pipe({
    name: 'values'
})
class ValuesPipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        if (!value) return;
        let keyArr = Object.keys(value),
            dataArr = new Array<any>();
        keyArr.forEach(key => {
            if (args && args.length > 0 && args[0].indexOf(key) !== -1) {
                dataArr.push(key);
            } else {
            }
        });
        return dataArr;
    }
}

@Component({
    selector: 'nsg-grid',
    pipes: [ValuesPipe],
    directives: [NgFor, NgStyle, NgClass, NgIf],
    styles: [`
        .container{
            margin: 2px;
        }
        .pointer{
            cursor:pointer
        }
        .pager>li{
            display:inline;
            margin:1px;
            float:left;
        }
        td,th{
            border-left:1px solid #ddd!important;
            border-right:1px solid #ddd!important;
        }
    `],
    template: `
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" />
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
            <div class="container-fluid">
                <div class="panel panel-header">
                    <!--<input type="text" [(ngModel)]="filter" (keyup)="filterData(filter)" />-->
                </div>
                <table class="table table-condensed" [ngClass]="{'table-hover': gridOptions ? gridOptions.tableHover : defaultGridOptions.tableHover, 'table-striped': gridOptions ? gridOptions.tableStriped : defaultGridOptions.tableStriped}">
                    <tr>
                        <th [style.text-align]="textAlign('center')" *ngFor="let column of gridColumns" [style.width]="column.width ? column.width + 'px' : 'auto'">
                            <span *ngIf="!column.sortable">{{column.caption ? column.caption : column.name}}</span>
                            <div>
                                <label *ngIf="column.sortable" class="pointer" (click)="onSort(column)" [style.cursor]="pointer">{{column.caption ? column.caption : column.name}}
                                <span><i class="fa" [ngClass]="{'fa-sort-asc': !column.sortDesc, 'fa-sort-desc':column.sortDesc}"></i></span></label>
                            </div>
                            <!--<input type="text" [(ngModel)]="column.filter" *ngIf="column.filterable" (keyup)="filterData(column)" />-->
                        </th>
                    </tr>
                    <tr *ngFor="let row of gridData" (click)="rowSelectedEvent(row)">
                        <td  *ngFor="let col of row | values : providedCols">
                            <span>{{row[col]}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td *ngIf="!gridData" [attr.colspan]="gridColumns.length">
                            <span>No Rows</span>
                        </td>
                    </tr>
                    <tr>
                        <td [attr.colspan]="gridColumns.length" [style.visible]="gridOptions ? gridOptions.pageable : defaultGridOptions.pageable">
                            <div class="footer" [style.display]="inline">
                                <div [style.float]="left">
                                    <ul class="pager" *ngIf="(pages && pages.length > 0)">
                                        <li>
                                            <a href="#" (click)="pageIt(0)">&lt;&lt;</a>
                                        </li>
                                        <li *ngFor="let num of pages">
                                            <a *ngIf="(num-1) !== pageNum" href="#" (click)="pageIt(num-1)">{{num}}</a>
                                            <span [style.background-color]="backGround()" [style.color]="color()" *ngIf="(num-1) === pageNum">{{num}}</span>
                                        </li>
                                        <li>
                                            <a href="#" (click)="pageIt(totalPages-1)">&gt;&gt;</a>
                                        </li>
                                        <li [style.floot]="right">

                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
                <div *ngIf="gridOptions ? gridOptions.showEvents : defaultGridOptions.showEvents">
                Event: {{gridEvent}}
                </div>
            </div>    
    `
})
export class NsgGrid implements AfterViewInit, OnChanges {
    @Input('grid-columns') gridColumns: GridColumn[];
    @Input('grid-data') gridData: Array<any>;
    @Input('grid-options') gridOptions: GridOptions;
    @Output() rowSelected: EventEmitter<any> = new EventEmitter<any>();
    private providedCols: string[] = [];
    private originalData: Array<any>;
    private filters: GridColumn[] = [];

    private totalPages: number;
    private pages: number[];
    private pageNum: number = 0;
    private maxPageNumToShow: number = 5;

    private defaultGridOptions: GridOptions = {
        pageable: true,
        pageSize: 10,
        tableHover: true,
        tableStriped: true,
        showEvents:false
    };

    /*Test*/
    private gridEvent: string;
    private showEvents: boolean = false;

    ngAfterViewInit() {
        if (this.gridColumns) {
            this.gridColumns.forEach(col => {
                this.providedCols.push(col.name);
                if (col.filterable) {
                    this.filters.push(col);
                }
            });
        }

        if (this.gridData) {
            this.originalData = this.gridData;
        }
    }

    ngOnChanges(changes: {
        [key: string]: SimpleChange;
    }) {
        if (changes["gridData"] && changes["gridData"].currentValue) {
            this.originalData = changes["gridData"].currentValue
            if (this.gridOptions && this.gridOptions.pageable) {
                this.pageIt(this.pageNum);
                this.totalPages = Math.ceil(this.originalData.length / this.gridOptions.pageSize);
                this.createPageNumbers(this.pageNum);
                console.log("Data loaded");
                this.gridEvent = "Data Loaded";
            }
        }
    }

    constructor() {
    }

    private onSort(column: GridColumn) {
        if (!this.gridData) return;
        if (!column.sortDesc) {
            var sortedArray = <Array<any>>this.gridData.sort((x, y) => {
                if (x[column.name] > y[column.name]) {
                    return 1;
                } else if (x[column.name] < y[column.name]) {
                    return -1;
                } else {
                    return 0;
                }
            });
            column.sortDesc = true;
        } else {
            var sortedArray = <Array<any>>this.gridData.reverse();
            column.sortDesc = false;
        }
        this.gridData = sortedArray;
    }

    private filterData(column: GridColumn) {
        var filteredData = <Array<any>>this.originalData.filter((data) => {
            if (data[column.name].indexOf(column.filter) !== -1) {
                return true;
            } else {
                return false;
            }
        });
        if (this.gridOptions && this.gridOptions.pageable)
            this.pageIt(this.pageNum);
        this.gridData = filteredData;
    }

    private pageIt(pageNum: number) {
        var pageSize = this.gridOptions ? this.gridOptions.pageSize : 10
        this.gridData = this.take(this.skip(this.originalData, pageSize * pageNum), pageSize);

        this.pageNum = pageNum;
        this.createPageNumbers(this.pageNum);
        this.gridEvent = "Page Changed";
    }

    private createPageNumbers(currentPage: number) {
        var numberOfPages = Math.ceil(this.originalData.length / (this.gridOptions ? this.gridOptions.pageSize : 10));
        var pageStart = currentPage === 0 ? currentPage : currentPage - 1;

        var tempPages = Array(this.maxPageNumToShow).fill(pageStart).map((x, i) => {
            return x + i + 1;
        });
        if (numberOfPages < this.maxPageNumToShow)
            tempPages = tempPages.slice(0, numberOfPages);
        this.pages = tempPages.filter((n) => {
            return n <= numberOfPages;
        })
    }

    private rowSelectedEvent(row: any) {
        this.rowSelected.emit(row);
        this.gridEvent = "Row Selected";
    }

    private backGround() {
        return "green";
    }
    private color() {
        return "white";
    }

    private textAlign(align: string) {
        return align;
    }
    private skip(array: Array<any>, count: number): Array<any> {
        return <Array<any>>array.slice(count);
    }

    private take(array: Array<any>, count: number): Array<any> {
        var takeArray = new Array<any>();
        for (var index = 0; index < count; index++) {
            if (index > array.length) break;
            var element = array[index];
            takeArray.push(element);
        }
        return takeArray;
    }
}
