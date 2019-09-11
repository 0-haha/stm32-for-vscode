"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var testMakefile = "##########################################################################################################################\n# File automatically-generated by tool: [projectgenerator] version: [3.3.0] date: [Mon Sep 09 15:06:00 CEST 2019]\n##########################################################################################################################\n\n# ------------------------------------------------\n# Generic Makefile (based on gcc)\n#\n# ChangeLog :\n#\t2017-02-10 - Several enhancements + project update mode\n#   2015-07-22 - first version\n# ------------------------------------------------\n\n######################################\n# target\n######################################\nTARGET = Clean_project_h7\n\n\n######################################\n# building variables\n######################################\n# debug build?\nDEBUG = 1\n# optimization\nOPT = -Og\n\n\n#######################################\n# paths\n#######################################\n# Build path\nBUILD_DIR = build\n\n######################################\n# source\n######################################\n# C sources\nC_SOURCES =  \\\nSrc/main.c \\\nSrc/stm32h7xx_it.c \\\nSrc/stm32h7xx_hal_msp.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_cortex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_eth.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_eth_ex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_tim.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_tim_ex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_uart.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_uart_ex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pcd.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pcd_ex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_ll_usb.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_rcc.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_rcc_ex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_flash.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_flash_ex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_gpio.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_hsem.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_dma.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_dma_ex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_mdma.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pwr.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pwr_ex.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_i2c.c \\\nDrivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_i2c_ex.c \\\nSrc/system_stm32h7xx.c  \n\n# ASM sources\nASM_SOURCES =  \\\nstartup_stm32h743xx.s\n\n\n#######################################\n# binaries\n#######################################\nPREFIX = arm-none-eabi-\n# The gcc compiler bin path can be either defined in make command via GCC_PATH variable (> make GCC_PATH=xxx)\n# either it can be added to the PATH environment variable.\nifdef GCC_PATH\nCC = $(GCC_PATH)/$(PREFIX)gcc\nAS = $(GCC_PATH)/$(PREFIX)gcc -x assembler-with-cpp\nCP = $(GCC_PATH)/$(PREFIX)objcopy\nSZ = $(GCC_PATH)/$(PREFIX)size\nelse\nCC = $(PREFIX)gcc\nAS = $(PREFIX)gcc -x assembler-with-cpp\nCP = $(PREFIX)objcopy\nSZ = $(PREFIX)size\nendif\nHEX = $(CP) -O ihex\nBIN = $(CP) -O binary -S\n \n#######################################\n# CFLAGS\n#######################################\n# cpu\nCPU = -mcpu=cortex-m7\n\n# fpu\nFPU = -mfpu=fpv5-d16\n\n# float-abi\nFLOAT-ABI = -mfloat-abi=hard\n\n# mcu\nMCU = $(CPU) -mthumb $(FPU) $(FLOAT-ABI)\n\n# macros for gcc\n# AS defines\nAS_DEFS = \n\n# C defines\nC_DEFS =  \\\n-DUSE_HAL_DRIVER \\\n-DSTM32H743xx \\\n-DUSE_HAL_DRIVER \\\n-DSTM32H743xx\n\n\n# AS includes\nAS_INCLUDES = \n\n# C includes\nC_INCLUDES =  \\\n-IInc \\\n-IDrivers/STM32H7xx_HAL_Driver/Inc \\\n-IDrivers/STM32H7xx_HAL_Driver/Inc/Legacy \\\n-IDrivers/CMSIS/Device/ST/STM32H7xx/Include \\\n-IDrivers/CMSIS/Include \\\n-IDrivers/CMSIS/Include\n\n\n# compile gcc flags\nASFLAGS = $(MCU) $(AS_DEFS) $(AS_INCLUDES) $(OPT) -Wall -fdata-sections -ffunction-sections\n\nCFLAGS = $(MCU) $(C_DEFS) $(C_INCLUDES) $(OPT) -Wall -fdata-sections -ffunction-sections\n\nifeq ($(DEBUG), 1)\nCFLAGS += -g -gdwarf-2\nendif\n\n\n# Generate dependency information\nCFLAGS += -MMD -MP -MF\"$(@:%.o=%.d)\"\n\n\n#######################################\n# LDFLAGS\n#######################################\n# link script\nLDSCRIPT = STM32H743ZITx_FLASH.ld\n\n# libraries\nLIBS = -lc -lm -lnosys\nLIBDIR = \nLDFLAGS = $(MCU) -specs=nano.specs -T$(LDSCRIPT) $(LIBDIR) $(LIBS) -Wl,-Map=$(BUILD_DIR)/$(TARGET).map,--cref -Wl,--gc-sections\n\n# default action: build all\nall: $(BUILD_DIR)/$(TARGET).elf $(BUILD_DIR)/$(TARGET).hex $(BUILD_DIR)/$(TARGET).bin\n\n\n#######################################\n# build the application\n#######################################\n# list of objects\nOBJECTS = $(addprefix $(BUILD_DIR)/,$(notdir $(C_SOURCES:.c=.o)))\nvpath %.c $(sort $(dir $(C_SOURCES)))\n# list of ASM program objects\nOBJECTS += $(addprefix $(BUILD_DIR)/,$(notdir $(ASM_SOURCES:.s=.o)))\nvpath %.s $(sort $(dir $(ASM_SOURCES)))\n\n$(BUILD_DIR)/%.o: %.c Makefile | $(BUILD_DIR) \n\t$(CC) -c $(CFLAGS) -Wa,-a,-ad,-alms=$(BUILD_DIR)/$(notdir $(<:.c=.lst)) $< -o $@\n\n$(BUILD_DIR)/%.o: %.s Makefile | $(BUILD_DIR)\n\t$(AS) -c $(CFLAGS) $< -o $@\n\n$(BUILD_DIR)/$(TARGET).elf: $(OBJECTS) Makefile\n\t$(CC) $(OBJECTS) $(LDFLAGS) -o $@\n\t$(SZ) $@\n\n$(BUILD_DIR)/%.hex: $(BUILD_DIR)/%.elf | $(BUILD_DIR)\n\t$(HEX) $< $@\n\t\n$(BUILD_DIR)/%.bin: $(BUILD_DIR)/%.elf | $(BUILD_DIR)\n\t$(BIN) $< $@\t\n\t\n$(BUILD_DIR):\n\tmkdir $@\t\t\n\n#######################################\n# clean up\n#######################################\nclean:\n\t-rm -fR $(BUILD_DIR)\n  \n#######################################\n# dependencies\n#######################################\n-include $(wildcard $(BUILD_DIR)/*.d)\n\n# *** EOF ***";
var _default = testMakefile;
exports["default"] = _default;