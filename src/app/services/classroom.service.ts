import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs';
import { ClassroomCollection } from '../model/classroom/classroom-collection';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private readonly API = '/api/classrooms';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<ClassroomCollection[]>(this.API).pipe(
      first()
    );
  }

  getById(id: string) {
    return this.http.get<ClassroomCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(classroom: Partial<ClassroomCollection>) {
    return this.http.post<ClassroomCollection>(this.API, classroom).pipe(
      first()
    );
  }

  update(classroom: Partial<ClassroomCollection>) {
    return this.http.put<ClassroomCollection>(`${this.API}/${classroom.id}`, classroom).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<ClassroomCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}
