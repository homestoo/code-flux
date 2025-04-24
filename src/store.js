import { createStore } from 'vuex'
import { generateUUID, atou, isMobileDevice } from '@/utils'
import { create, request } from '@/utils/octokit'
import { ElMessage } from 'element-plus'
import defaltCode from '@/config/defaltCode'

const isMobile = isMobileDevice()

// 存储github token的本地存储的key
const githubTokenSaveKey = 'codeRun:githubToken'
// 添加配置存储key
const configSaveKey = 'codeRun:config'
// 存储初始代码配置的key
const initialCodeSaveKey = 'codeRun:initialCode'
// 私有配置存储key
const privateConfigKey = 'codeRun:privateConfig'

// 默认配置常量
const DEFAULT_CONFIG = {
  codeTheme: 'OneDarkPro',
  pageThemeSyncCodeTheme: true,
  syncLayout: false,
  openAlmightyConsole: isMobile ? true : false,
  autoRun: true,
  layout: isMobile ? 'tabs2' : 'default',
  keepPreviousLogs: isMobile ? false : true,
  codeFontSize: isMobile ? 12 : 14
}

// 默认私有配置
const DEFAULT_PRIVATE_CONFIG = {
  saveCallback: '' // 保存回调脚本
}

// 获取保存的私有配置
const getSavedPrivateConfig = () => {
  try {
    const saved = localStorage.getItem(privateConfigKey)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.error('读取私有配置失败:', e)
    return null
  }
}

// 从localStorage获取保存的配置
const getSavedConfig = () => {
  try {
    const savedConfig = localStorage.getItem(configSaveKey)
    return savedConfig ? JSON.parse(savedConfig) : null
  } catch (e) {
    console.error('读取配置失败:', e)
    return null
  }
}

// 从localStorage获取保存的初始代码配置
const getSavedInitialCode = () => {
  try {
    const savedInitialCode = localStorage.getItem(initialCodeSaveKey)
    return savedInitialCode ? JSON.parse(savedInitialCode) : null
  } catch (e) {
    console.error('读取初始代码配置失败:', e)
    return null
  }
}

// 生成默认编辑数据
const createDefaultData = (blank = false) => {
  const savedConfig = getSavedConfig()
  const savedInitialCode = getSavedInitialCode()

  let code = savedInitialCode || { ...defaltCode }
  
  /* 使用空白数据 */
  if (blank) {
    code = {
      JS: {
        content: '',
        language: 'javascript',
        resources: []
      },
      HTML: {
        content: '',
        language: 'html',
        resources: []
      },
      CSS: {
        content: '',
        language: 'css',
        resources: []
      }
    }
  }

  return {
    config: savedConfig || { ...DEFAULT_CONFIG },
    title: '未命名',
    code
  }
}

const store = createStore({
  state() {
    return {
      uuid: generateUUID(),
      loading: false,
      editData: createDefaultData(),
      githubToken: '',
      previewDoc: '',
      privateConfig: getSavedPrivateConfig() || { ...DEFAULT_PRIVATE_CONFIG }
    }
  },
  mutations: {
    /**
     * @Desc: 设置编辑数据
     */
    setEditData(state, data) {
      state.editData = data
    },

    /**
     * @Desc: 设置代码内容
     */
    setCodeContent(state, { type, code }) {
      state.editData.code[type].content = code
    },

    /**
     * @Desc: 设置代码预处理器
     */
    setCodePreprocessor(state, { type, preprocessor }) {
      state.editData.code[type].language = preprocessor
    },

    /**
     * @Desc: 设置资源
     */
    setCodeResource(state, { type, resources }) {
      state.editData.code[type].resources = resources
    },

    /**
     * @Desc: 设置import map
     */
    setImportMap(state, importMap) {
      state.editData.code.JS.importMap = importMap
    },

    /**
     * @Desc: 设置代码数据
     */
    setCode(state, data) {
      state.editData.code = data
    },

    /**
     * @Desc: 设置代码主题
     */
    setCodeTheme(state, theme) {
      state.editData.config.codeTheme = theme
      this.commit('saveConfig')
    },

    /**
     * @Desc: 设置自动运行的状态
     */
    setAutoRun(state, autoRun) {
      state.editData.config.autoRun = autoRun
      this.commit('saveConfig')
    },

    /**
     * @Desc: 设置全能调试
     */
    setOpenAlmightyConsole(state, openAlmightyConsole) {
      state.editData.config.openAlmightyConsole = openAlmightyConsole
      this.commit('saveConfig')
    },

    /**
     * @Desc: 设置布局
     */
    setLayout(state, layout) {
      state.editData.config.layout = layout
      this.commit('saveConfig')
    },

    /**
     * @Desc: 设置是否保留之前的日志
     */
    setKeepPreviousLogs(state, keepPreviousLogs) {
      state.editData.config.keepPreviousLogs = keepPreviousLogs
      this.commit('saveConfig')
    },

    /**
     * @Desc: 设置编辑器字号
     */
    setCodeFontSize(state, codeFontSize) {
      state.editData.config.codeFontSize = codeFontSize
      this.commit('saveConfig')
    },

    setPageThemeSyncCodeTheme(state, pageThemeSyncCodeTheme) {
      state.editData.config.pageThemeSyncCodeTheme = pageThemeSyncCodeTheme
      this.commit('saveConfig')
    },

    setGithubToken(state, githubToken) {
      state.githubToken = githubToken || ''
      create(githubToken)
    },

    setCodeTitle(state, title) {
      state.editData.title = title
    },

    setPreviewDoc(state, previewDoc) {
      state.previewDoc = previewDoc
    },

    // 保存配置到localStorage
    saveConfig(state) {
      try {
        localStorage.setItem(configSaveKey, JSON.stringify(state.editData.config))
      } catch (e) {
        console.error('保存配置失败:', e)
      }
    },

    // 添加重置配置的mutation
    resetToDefaultSettings(state) {
      // 先删除localStorage中保存的配置
      localStorage.removeItem(configSaveKey)
      
      // 重置为默认配置
      state.editData.config = { ...DEFAULT_CONFIG }
    },

    setInitialCode(state, { type, content }) {
      try {
        const currentInitialCode = localStorage.getItem(initialCodeSaveKey)
        const initialCode = currentInitialCode ? JSON.parse(currentInitialCode) : { ...defaltCode }
        initialCode[type].content = content
        localStorage.setItem(initialCodeSaveKey, JSON.stringify(initialCode))
      } catch (e) {
        console.error('保存初始代码失败:', e)
      }
    },

    resetInitialCode(state) {
      try {
        localStorage.removeItem(initialCodeSaveKey)
        state.editData.code = { ...defaltCode }
      } catch (e) {
        console.error('重置初始代码失败:', e)
      }
    },

    setSyncLayout(state, syncLayout) {
      state.editData.config.syncLayout = syncLayout
      this.commit('saveConfig')
    },

    setLoading(state, loading) {
      state.loading = loading
    },

    setSaveCallback(state, script) {
      state.privateConfig.saveCallback = script
      this.commit('savePrivateConfig')
    },

    // 保存私有配置
    savePrivateConfig(state) {
      try {
        localStorage.setItem(privateConfigKey, JSON.stringify(state.privateConfig))
      } catch (e) {
        console.error('保存私有配置失败:', e)
      }
    }
  },
  actions: {
    getData(ctx, { id, data, blank }) {
      return new Promise(async (resolve, reject) => {
        try {
          let parseData = createDefaultData(blank || false)
          if (id) {
            let { data } = await request(`GET /gists/${id}`, {
              gist_id: id
            })
            parseData = JSON.parse(data.files['coderun.json'].content)
          } else if (data) {
            parseData = JSON.parse(atou(data))
          }
          
          // 如果不同步布局，则保持当前布局不变
          if (!ctx.state.editData.config.syncLayout) {
            const currentLayout = ctx.state.editData.config.layout
            parseData.config.layout = currentLayout
          }
          
          // 保留当前的 saveCallback
          const currentCallback = ctx.state.editData.config.saveCallback
          parseData.config.saveCallback = currentCallback
          
          ctx.commit('setEditData', parseData)
          resolve()
        } catch (e) {
          console.log(e)
          ElMessage.error('请求失败')
          reject(e)
        }
      })
    },

    saveGithubToken(ctx, githubToken) {
      ctx.commit('setGithubToken', githubToken)
      if (githubToken) {
        localStorage.setItem(githubTokenSaveKey, githubToken)
      } else {
        localStorage.removeItem(githubTokenSaveKey)
      }
    },

    getGithubToken(ctx) {
      let githubToken = localStorage.getItem(githubTokenSaveKey)
      ctx.commit('setGithubToken', githubToken)
    },
    
    clearAllCode(ctx) {
      const currentData = JSON.parse(JSON.stringify(ctx.state.editData))
      
      Object.keys(currentData.code).forEach(key => {
        currentData.code[key].content = ''
      })
      
      ctx.commit('setEditData', currentData)
      
      return Promise.resolve()
    }
  }
})

export default store
