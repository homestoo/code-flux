<template>
  <Drag :number="2" dir="h" :config="[{ min: 0 }, { min: 20 }]">
    <!-- 编辑器&控制台 -->
    <DragItem :index="0" :disabled="true" :showTouchBar="false">
      <Drag
        :number="isMobile ? 1 : 2"
        dir="v"
        :config="isMobile 
          ? [{ min: 0 }] 
          : [{ min: 0 }, { min: 48, default: 48 }]"
      >
        <!-- 编辑器 -->
        <DragItem :index="0" :disabled="true" :showTouchBar="false">
          <Editor></Editor>
        </DragItem>
        <DragItem v-if="!isMobile" :index="1" :disabled="false" title="控制台">
          <Console></Console>
        </DragItem>
      </Drag>
    </DragItem>
    <!-- 预览 -->
    <DragItem :index="1" :disabled="false">
      <Preview></Preview>
    </DragItem>
  </Drag>
</template>

<script setup>
import Editor from '@/components/Editor.vue'
import Preview from '@/components/Preview.vue'
import Console from '@/components/Console.vue'
import Drag from '@/components/Drag.vue'
import DragItem from '@/components/DragItem.vue'
import { isMobileDevice } from '@/utils'

const isMobile = isMobileDevice()
</script>
