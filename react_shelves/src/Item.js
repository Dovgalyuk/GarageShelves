import React from 'react'
import { ItemListSection } from './Item/ListSection';

export function ItemLatest(props) {
    return (
        <ItemListSection
          title="Latest collected items"
          filter={{latest:12}}
        />
    );
}
