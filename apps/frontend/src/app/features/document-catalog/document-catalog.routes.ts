import { Routes } from "@angular/router";
import { DocumentType } from "./document-type/document-type";
import { DocumentCategory } from "./document-category/document-category";

export const documentCatalogRoutes: Routes = [
    {path: 'document-type', component: DocumentType},
    {path: 'document-category', component: DocumentCategory}
]