<template>
  <Drag :number="2" dir="h" :config="[{ min: 0 }, { min: 20, default: 480 }]">
    <!-- 预览&控制台 -->
    <DragItem :index="0" :disabled="true" title="预览" :showTouchBar="false">
      <Drag
        :number="isMobile ? 1 : 2"
        dir="v"
        :config="isMobile 
          ? [{ min: 0 }] 
          : [{ min: 0 }, { min: 24, default: 24 }]"
      >
        <DragItem
          :index="0"
          :disabled="true"
          :showTouchBar="false"
          title="预览"
        >
          <Preview></Preview>
        </DragItem>
        <DragItem v-if="!isMobile" :index="1" :disabled="false" title="控制台">
          <Console></Console>
        </DragItem>
      </Drag>
    </DragItem>
    <!-- 编辑器 -->
    <DragItem :index="1" :disabled="false" :showTouchBar="true">
      <Editor dir="v"></Editor>
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
