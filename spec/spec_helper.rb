﻿require 'capybara/rspec'
require 'capybara/poltergeist'

Capybara.run_server = false
Capybara.default_driver = :poltergeist
Capybara.app_host = 'http://127.0.0.1:5984/traduxio/_design/traduxio/_rewrite/'
Capybara.default_max_wait_time = 5

RSpec.configure do |config|
  config.before(:each) do
    prefer_language 'en'
  end
end

def sample(name)
  IO.read("spec/samples/#{name}.txt")
end

def row(row)
  find("#hexapla tr:nth-child(#{row}) .text")
end

def prefer_language(language)
	page.driver.add_headers("Accept-Language"=>language)
end

def should_have_in_bold(text)
	expect(page).to have_css('b', :text => text)
end

def wait_for_ajax
  Timeout.timeout(Capybara.default_max_wait_time) do
    loop until finished_all_ajax_requests?
  end
end

def finished_all_ajax_requests?
  page.evaluate_script('jQuery.active').zero?
end

def fill_field(name,value)
  input=find("[name='"+name+"']")
  input.set(value)
  input.trigger(:blur)
  wait_for_ajax
end

def fill_select(name,option)
  input=find("select[name='"+name+"']")
  option=input.find("option[value='"+option+"']")
  select(option.text, :from => name)
  input.trigger(:blur)
  wait_for_ajax
end

def fill_block(version,row,text)
  within block(version,row) do
    ta=find('textarea')
    ta.set(text)
    ta.trigger(:blur)
    wait_for_ajax
  end
end

def wait_for_element (selector)
  Timeout.timeout(Capybara.default_max_wait_time) do
    loop until page.has_selector?(selector)
  end
rescue Timeout::Error
  raise "didn't find "+selector+" in page after "+Capybara.default_max_wait_time.to_s
end

def block(version, row)
  table=page.find("table#hexapla")
  row=table.find("tr[data-line='"+row.to_s+"']")
  row.find("td.edit[data-version='"+version+"']")
end
