<script setup>
import { NConfigProvider, NDialogProvider, NMessageProvider } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#5F6F52',
    primaryColorHover: '#4E5D44',
    primaryColorPressed: '#43503A',
    primaryColorSuppl: '#5F6F52',
    bodyColor: '#FFFDF8',
    cardColor: '#FFFDF8',
    modalColor: '#FFFDF8',
    popoverColor: '#FFFDF8',
    textColorBase: '#1E1E1E',
    textColor1: '#1E1E1E',
    textColor2: '#6B6B6B',
    borderColor: '#E5DED3',
    dividerColor: '#E5DED3',
  },
  Button: {
    colorPrimary: '#5F6F52',
    colorHoverPrimary: '#4E5D44',
    colorPressedPrimary: '#43503A',
    colorFocusPrimary: '#5F6F52',
    textColorPrimary: '#FFFDF8',
    borderPrimary: '1px solid #5F6F52',
    borderHoverPrimary: '1px solid #4E5D44',
    borderPressedPrimary: '1px solid #43503A',
    borderFocusPrimary: '1px solid #5F6F52',
  },
  Input: {
    color: '#FFFDF8',
    colorFocus: '#FFFDF8',
    border: '1px solid #E5DED3',
    borderHover: '1px solid #D6C7A1',
    borderFocus: '1px solid #5F6F52',
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <RouterView />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
