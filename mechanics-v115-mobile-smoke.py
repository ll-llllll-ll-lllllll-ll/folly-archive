import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL = 'http://127.0.0.1:8000/mechanics.html'

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--window-size=390,844')
opts.add_argument('--force-device-scale-factor=1')

driver = webdriver.Chrome(options=opts)
wait = WebDriverWait(driver, 15)


def js(script, *args):
    return driver.execute_script(script, *args)


def click_css(selector):
    el = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
    js('arguments[0].click()', el)
    return el

try:
    driver.get(URL)
    wait.until(lambda d: js("return document.readyState") == 'complete')
    wait.until(lambda d: js("return getComputedStyle(document.getElementById('mobile-workspace-nav')).display") != 'none')

    # Initial mobile state: works panel only.
    assert js("return document.body.dataset.mobileView") == 'works'
    assert js("return getComputedStyle(document.getElementById('project-index')).display") != 'none'
    assert js("return getComputedStyle(document.getElementById('engineering-index')).display") == 'none'

    # Expand a work/project card.
    project = click_css('.selection-project-select')
    wait.until(lambda d: js("return !!document.querySelector('.selection-node.is-project-card.is-card-selected')"))
    assert js("return document.body.dataset.mobileView") == 'works'
    assert js("return !!document.querySelector('.selection-node.is-project-card.is-card-selected .selection-children')")

    # Choose a technical point: mobile should move to the database view.
    tech = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.selection-node.is-project-card.is-card-selected .selection-children .selection-select')))
    js('arguments[0].click()', tech)
    wait.until(lambda d: js("return document.body.dataset.mobileView") == 'database')
    wait.until(lambda d: js("return !!document.querySelector('.taxonomy-node.is-target')"))
    assert js("return getComputedStyle(document.getElementById('engineering-index')).display") != 'none'
    assert js("return getComputedStyle(document.getElementById('project-index')).display") == 'none'

    # Unrelated mobile taxonomy branches should be folded.
    assert js("return document.querySelectorAll('.taxonomy-node.is-mobile-collapsed').length") > 0

    # Context/breadcrumb should be populated and archive count should exist for a real record.
    context = js("return document.getElementById('mobile-workspace-context').textContent.trim()")
    assert context and '未选择技术点' not in context
    count_text = js("return document.getElementById('mobile-archive-count').textContent.trim()")
    assert count_text.isdigit() and int(count_text) >= 1

    # Switch to archive; file sheet and persistent file rack should remain operable.
    click_css('[data-mobile-view-target="archive"]')
    wait.until(lambda d: js("return document.body.dataset.mobileView") == 'archive')
    assert js("return getComputedStyle(document.getElementById('archive-stage')).display") != 'none'
    wait.until(lambda d: js("return !!document.querySelector('.archive-sheet.is-front')"))
    wait.until(lambda d: js("return !!document.querySelector('.file-tray-item')"))

    # Zoom viewer should open and close without dismissing the workspace.
    zoom = driver.find_elements(By.CSS_SELECTOR, '.sheet-open-source:not([hidden])')
    if zoom:
        js('arguments[0].click()', zoom[0])
        wait.until(lambda d: js("return document.querySelector('.mechanics-zoom-viewer')?.classList.contains('is-open')"))
        close = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.mechanics-zoom-close')))
        js('arguments[0].click()', close)
        wait.until(lambda d: not js("return document.querySelector('.mechanics-zoom-viewer')?.classList.contains('is-open')"))

    # Nav taps must not dismiss the active work selection.
    click_css('[data-mobile-view-target="works"]')
    wait.until(lambda d: js("return document.body.dataset.mobileView") == 'works')
    assert js("return !!document.querySelector('.selection-node.is-project-card.is-card-selected')")

    # Night mode: expanded card should not become a white slab.
    slider = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-reader-tone]')))
    js("arguments[0].value='100'; arguments[0].dispatchEvent(new Event('input',{bubbles:true})); arguments[0].dispatchEvent(new Event('change',{bubbles:true}));", slider)
    time.sleep(.25)
    rgb = js("return getComputedStyle(document.querySelector('.selection-node.is-project-card.is-card-selected')).backgroundColor")
    nums = [int(x) for x in __import__('re').findall(r'\d+', rgb)[:3]]
    assert len(nums) == 3 and sum(nums)/3 < 180, f'night card too bright: {rgb}'

    # Language switch remains functional in the new mobile nav.
    ja = click_css('[data-lang-switch="ja"]')
    wait.until(lambda d: js("return document.querySelector('[data-mobile-view-target=\"database\"] span').textContent.trim()") != '数据库')

    print('MOBILE_SMOKE_OK')
finally:
    driver.quit()
