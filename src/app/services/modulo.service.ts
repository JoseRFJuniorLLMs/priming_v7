import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs';
import { ModuloCollection } from '../model/modulo/modulo-collection';

@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private readonly API = '/api/modulos';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<ModuloCollection[]>(this.API).pipe(
      first()
    );
  }

  getById(id: string) {
    return this.http.get<ModuloCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(modulo: Partial<ModuloCollection>) {
    return this.http.post<ModuloCollection>(this.API, modulo).pipe(
      first()
    );
  }

  update(modulo: Partial<ModuloCollection>) {
    return this.http.put<ModuloCollection>(`${this.API}/${modulo.id}`, modulo).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<ModuloCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}
