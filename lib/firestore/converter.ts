import { DocumentData, DocumentSnapshot } from 'firebase/firestore';

export interface IConverter<T> {
  toFirestore(data: T): DocumentData;
  fromFirestore(snapshot: DocumentSnapshot): T;
}
