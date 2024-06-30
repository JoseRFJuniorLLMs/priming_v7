import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs';
import { TeacherCollection } from '../model/Teacher/Teacher-collection';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly API = '/api/profteacheressors';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<TeacherCollection[]>(this.API).pipe(
      first()
    );
  }

  getById(id: string) {
    return this.http.get<TeacherCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(Teacher: TeacherCollection) {
    return this.http.post<TeacherCollection>(this.API, Teacher).pipe(
      first()
    );
  }

  update(Teacher: TeacherCollection) {
    return this.http.put<TeacherCollection>(`${this.API}/${Teacher.id}`, Teacher).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<TeacherCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}
