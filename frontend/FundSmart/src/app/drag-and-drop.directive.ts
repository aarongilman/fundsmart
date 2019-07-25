import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
    selector: '[appDragAndDrop]'
})

export class DragAndDropDirective {

    constructor() { }

    @Output() onFileDropped = new EventEmitter<any>();

    @HostListener('dragover', ['$event']) onDragOver(evt) {
        evt.preventDefault();
        evt.stopPropagation();
    }

    @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
        evt.preventDefault();
        evt.stopPropagation();
    }

    @HostListener('drop', ['$event']) public ondrop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const files = evt.dataTransfer.files;
        if (files.length > 0) {
            this.onFileDropped.emit(files);
        }
    }
    
}
