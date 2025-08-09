import React from 'react';
import { AppLocale } from './index';

export const I18nContext = React.createContext<{ t: (k: string)=>string; locale: AppLocale; setLocale: (l: AppLocale)=>void }>({ t: (k)=>k, locale: 'en', setLocale: ()=>{} });
