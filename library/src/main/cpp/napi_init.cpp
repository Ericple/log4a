#include "napi/native_api.h"
#include "includes/oapi.h"
#include "map"
#include "string"

static std::map<std::string, napi_value> loggerMap = {};

static std::string getValidChar(char* str) {
    std::string result(str);
    return result;
//     int idx = 0, len = strlen(str);
//     char *result = "hg";
//     while(idx<len){
//         if(str[idx]!='\0'){
//             sprintf(result, "%s%c", result, str[idx]);
//         }else{
//             break;
//         }
//         idx++;
//     }
//     return result;
}

J_API(hasLogger) {
    INIT_ENV(1, args, this_arg, data);
    C_U8Str(identStr, args[0], size_result);
    auto ident = getValidChar(identStr);
    auto iter = loggerMap.find(ident);
    if(iter != loggerMap.end()){
        J_Boolean(TRUE, true);
        return TRUE;
    }
    J_Boolean(FALSE, false);
    return FALSE;
}

J_API(getLogger){
    INIT_ENV(1, args, this_arg, data);
    C_U8Str(identStr, args[0], size_result);
    auto ident = getValidChar(identStr);
    auto iter = loggerMap.find(ident);
    if(iter != loggerMap.end()) {
        napi_value ret = iter->second;
        J_VAL(constructor);
        napi_get_named_property(env, ret, "constructor", &constructor);
        J_VAL(name);
        napi_get_named_property(env, constructor, "name", &name);
        C_U8Str(constructorName, name, size_result);
        return iter->second;
    }
    J_Undefined(undefined);
    return undefined;
}

J_API(createLogger){
    INIT_ENV(2, args, this_arg, data);
    J_Undefined(undefined);
    C_U8Str(identStr, args[0], size_result);
    J_VAL(a);
    napi_get_named_property(env, args[1], "constructor", &a);
    J_VAL(consName);
    napi_get_named_property(env, a, "name", &consName);
    C_U8Str(logPath, consName, s);
    auto ident = getValidChar(identStr);
    loggerMap.insert({ident, args[1]});
    return undefined;
}

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports)
{
    napi_property_descriptor desc[] = {
        { "getLogger", nullptr, getLogger, nullptr, nullptr, nullptr, napi_default, nullptr },
        { "createLogger", nullptr, createLogger, nullptr, nullptr, nullptr, napi_default, nullptr },
        { "hasLogger", nullptr, hasLogger, nullptr, nullptr, nullptr, napi_default, nullptr },
    };
    napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);
    return exports;
}
EXTERN_C_END

static napi_module demoModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = Init,
    .nm_modname = "liblog4a",
    .nm_priv = ((void*)0),
    .reserved = { 0 },
};

extern "C" __attribute__((constructor)) void RegisterLibLog4aModule(void)
{
    napi_module_register(&demoModule);
}
